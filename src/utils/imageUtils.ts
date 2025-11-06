// Кеш для доминантных цветов
const colorCache = new Map<string, string | null>();

/**
 * Извлекает основной цвет из изображения, используя уже загруженное изображение если возможно
 * @param {string} imgSrc - Путь к изображению
 * @param {function} callback - Функция для возврата извлеченного цвета
 */
export const extractDominantColor = (
  imgSrc: string,
  callback: (color: string | null) => void
): void => {
  // Проверяем кеш
  if (colorCache.has(imgSrc)) {
    callback(colorCache.get(imgSrc) || null);
    return;
  }

  // Пытаемся найти уже загруженное изображение в DOM
  // Ищем по разным вариантам URL (с параметрами и без)
  const imgSrcClean = imgSrc.split('?')[0];
  const existingImg = Array.from(document.querySelectorAll('img')).find(
    (img) => {
      const src = img.getAttribute('src') || '';
      // Более точное сравнение - проверяем точное совпадение или включение пути
      return src === imgSrc || 
             src === imgSrcClean || 
             (src.includes(imgSrcClean) && imgSrcClean.length > 10); // Минимальная длина для избежания ложных совпадений
    }
  ) as HTMLImageElement | undefined;
  
  if (existingImg) {
    // Изображение найдено в DOM
    if (existingImg.complete && existingImg.naturalWidth > 0) {
      // Изображение полностью загружено, пытаемся извлечь цвет
      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) {
          colorCache.set(imgSrc, null);
          callback(null);
          return;
        }

        canvas.width = existingImg.naturalWidth;
        canvas.height = existingImg.naturalHeight;

        context.drawImage(existingImg, 0, 0);

        // Берем пиксель из центра изображения
        const centerX = Math.floor(existingImg.naturalWidth / 2);
        const centerY = Math.floor(existingImg.naturalHeight / 2);
        
        let data: Uint8ClampedArray;
        try {
          data = context.getImageData(centerX, centerY, 1, 1).data;
        } catch (corsError) {
          // CORS ошибка - изображение "tainted" (загрязнено), нельзя получить данные через canvas
          // Это происходит, если изображение загружено с другого домена без CORS заголовков
          // Не пытаемся перезагружать - просто используем fallback
          colorCache.set(imgSrc, null);
          callback(null);
          return;
        }

        // Возвращаем RGB значение
        const color = `${data[0]}, ${data[1]}, ${data[2]}`;

        // Сохраняем в кеш
        colorCache.set(imgSrc, color);

        callback(color);
      } catch (error) {
        console.error(`Error processing existing image: ${imgSrc}`, error);
        colorCache.set(imgSrc, null);
        callback(null);
      }
    } else {
      // Изображение загружается, ждем его полной загрузки
      existingImg.addEventListener('load', () => {
        // Проверяем еще раз после загрузки
        if (existingImg.complete && existingImg.naturalWidth > 0) {
          extractDominantColor(imgSrc, callback);
        } else {
          colorCache.set(imgSrc, null);
          callback(null);
        }
      }, { once: true });
      
      existingImg.addEventListener('error', () => {
        colorCache.set(imgSrc, null);
        callback(null);
      }, { once: true });
      
      // Если изображение уже загружено, но событие load не сработало
      if (existingImg.complete) {
        // Небольшая задержка на случай, если изображение только что загрузилось
        setTimeout(() => {
          if (existingImg.complete && existingImg.naturalWidth > 0) {
            extractDominantColor(imgSrc, callback);
          }
        }, 100);
      }
    }
  } else {
    // Изображения нет в DOM - не пытаемся загружать его специально для извлечения цвета
    // Это позволяет избежать CORS ошибок и лишних запросов
    // Используем fallback цвет, если изображение не найдено в DOM
    // Цвет будет извлечен позже, когда изображение загрузится в DOM (например, в HeaderPlayer)
    colorCache.set(imgSrc, null);
    callback(null);
  }
};


