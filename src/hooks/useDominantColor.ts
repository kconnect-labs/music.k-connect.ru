import { useState, useEffect, useMemo } from 'react';
import { extractDominantColor } from '../utils/imageUtils';
import MusicService, { Track } from '../services/MusicService';

export interface DominantColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Хук для извлечения доминирующего цвета из обложки трека
 * @param currentTrack - Текущий трек
 * @returns Объект с цветами и значениями
 */
export const useDominantColor = (currentTrack: Track | null) => {
  const [dominantColor, setDominantColor] = useState<DominantColor | null>(null);

  // Извлечение доминирующего цвета из обложки
  useEffect(() => {
    if (currentTrack) {
      const coverUrl = MusicService.getCoverUrl(currentTrack);
      
      if (coverUrl) {
        // Сбрасываем цвет перед загрузкой нового
        setDominantColor(null);
        
        // Пробуем извлечь цвет из уже загруженного изображения
        extractDominantColor(coverUrl, (colorString: string | null) => {
          if (colorString) {
            try {
              const [r, g, b] = colorString.split(',').map((c) => parseInt(c.trim(), 10));
              
              // Проверяем валидность цветов
              if (isNaN(r) || isNaN(g) || isNaN(b)) {
                setDominantColor({ r: 208, g: 188, b: 255 }); // Fallback
                return;
              }
              
              // Проверяем, не является ли цвет слишком светлым или белым
              const brightness = (r + g + b) / 3;
              const isTooLight = brightness > 180;
              const isTooWhite = r > 220 && g > 220 && b > 220;
              
              if (isTooLight || isTooWhite) {
                // Используем цвет по умолчанию
                setDominantColor({ r: 208, g: 188, b: 255 }); // var(--theme-button-main)
              } else {
                // Используем цвет из обложки
                setDominantColor({ r, g, b });
              }
            } catch (error) {
              console.error('Error parsing color:', error, 'from string:', colorString);
              setDominantColor({ r: 208, g: 188, b: 255 }); // Fallback
            }
          } else {
            // Цвет не извлечен - используем fallback
            // Не пытаемся загружать изображение специально, чтобы избежать CORS ошибок
            setDominantColor({ r: 208, g: 188, b: 255 }); // Fallback
          }
        });
        
        // Пытаемся извлечь цвет после того, как изображение загрузится в HeaderPlayer
        // Проверяем наличие изображения в DOM с интервалами
        const checkImageLoaded = () => {
          const img = Array.from(document.querySelectorAll('img')).find(
            (img) => {
              const src = img.getAttribute('src') || '';
              const imgSrcClean = coverUrl.split('?')[0];
              return src === coverUrl || src === imgSrcClean || (src.includes(imgSrcClean) && imgSrcClean.length > 10);
            }
          ) as HTMLImageElement | undefined;
          
          if (img) {
            if (img.complete && img.naturalWidth > 0) {
              // Изображение полностью загружено, пытаемся извлечь цвет
              extractDominantColor(coverUrl, (colorString: string | null) => {
                if (colorString) {
                  try {
                    const [r, g, b] = colorString.split(',').map((c) => parseInt(c.trim(), 10));
                    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                      const brightness = (r + g + b) / 3;
                      const isTooLight = brightness > 180;
                      const isTooWhite = r > 220 && g > 220 && b > 220;
                      if (!isTooLight && !isTooWhite) {
                        setDominantColor({ r, g, b });
                        return true; // Успешно извлекли цвет
                      }
                    }
                  } catch (error) {
                    // Игнорируем ошибки
                  }
                }
                return false; // Цвет не извлечен
              });
              return true; // Изображение найдено и обработано
            } else {
              // Изображение еще загружается, ждем
              img.addEventListener('load', () => {
                extractDominantColor(coverUrl, (colorString: string | null) => {
                  if (colorString) {
                    try {
                      const [r, g, b] = colorString.split(',').map((c) => parseInt(c.trim(), 10));
                      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                        const brightness = (r + g + b) / 3;
                        const isTooLight = brightness > 180;
                        const isTooWhite = r > 220 && g > 220 && b > 220;
                        if (!isTooLight && !isTooWhite) {
                          setDominantColor({ r, g, b });
                        }
                      }
                    } catch (error) {
                      // Игнорируем ошибки
                    }
                  }
                });
              }, { once: true });
              return true; // Изображение найдено, ждем загрузки
            }
          }
          return false; // Изображение не найдено
        };
        
        // Проверяем сразу
        if (checkImageLoaded()) {
          // Изображение найдено, проверяем еще раз после задержки на случай, если оно только что загрузилось
          const timeoutId = setTimeout(() => {
            checkImageLoaded();
          }, 300);
          
          return () => {
            clearTimeout(timeoutId);
          };
        } else {
          // Изображение не найдено, проверяем через интервалы
          const intervalId = setInterval(() => {
            if (checkImageLoaded()) {
              clearInterval(intervalId);
            }
          }, 200);
          
          // Останавливаем проверку через 3 секунды
          const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
          }, 3000);
          
          return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
          };
        }
      } else {
        setDominantColor(null);
      }
    } else {
      setDominantColor(null);
    }
  }, [currentTrack?.id, currentTrack?.cover_path]);

  // Мемоизированные цветовые значения
  const activeColor = useMemo(() => {
    if (dominantColor) {
      return `rgb(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})`;
    }
    // Fallback на цвет темы
    return 'rgb(208, 188, 255)'; // #D0BCFF
  }, [dominantColor]);

  const backgroundColor = useMemo(() => {
    if (dominantColor) {
      return `rgb(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})`;
    }
    return 'var(--theme-button-main, #D0BCFF)';
  }, [dominantColor]);

  const rgbaColor = useMemo(() => {
    if (dominantColor) {
      return `rgba(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}, 1)`;
    }
    return 'rgba(208, 188, 255, 1)';
  }, [dominantColor]);

  return {
    dominantColor,
    activeColor,
    backgroundColor,
    rgbaColor,
  };
};

