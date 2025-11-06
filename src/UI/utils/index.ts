/**
 * Утилиты для UI компонентов
 */

/**
 * Объединяет классы CSS в одну строку
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Форматирует размеры для CSS
 */
export const formatSize = (size: number | string, unit: string = 'px'): string => {
  if (typeof size === 'string') return size;
  return `${size}${unit}`;
};

/**
 * Получает CSS переменную темы
 */
export const getThemeVar = (varName: string, fallback?: string): string => {
  if (typeof window === 'undefined') return fallback || '';
  
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  
  return value || fallback || '';
};

/**
 * Проверяет поддержку backdrop-filter
 */
export const supportsBackdropFilter = (): boolean => {
  if (typeof window === 'undefined') return false;
  return CSS.supports('backdrop-filter', 'blur(1px)') || 
         CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
};

/**
 * Дебаунс функция
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Троттлинг функция
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

