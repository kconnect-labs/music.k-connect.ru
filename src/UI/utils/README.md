# UI Утилиты

Набор утилитарных функций для работы с UI компонентами.

## Функции

### `cn(...classes)`

Объединяет классы CSS в одну строку, фильтруя `undefined`, `null` и `false`.

```tsx
import { cn } from '@/UI/utils';

const className = cn(
  'base-class',
  isActive && 'active',
  isDisabled && 'disabled',
  undefined, // будет проигнорирован
  null,      // будет проигнорирован
  false      // будет проигнорирован
);
// Результат: "base-class active disabled"
```

### `formatSize(size, unit)`

Форматирует размеры для CSS.

```tsx
import { formatSize } from '@/UI/utils';

formatSize(16);        // "16px"
formatSize(16, 'rem'); // "16rem"
formatSize('100%');    // "100%"
```

### `getThemeVar(varName, fallback)`

Получает значение CSS переменной темы.

```tsx
import { getThemeVar } from '@/UI/utils';

const primaryColor = getThemeVar('--theme-main-color', '#D0BCFF');
const borderRadius = getThemeVar('--main-border-radius', '18px');
```

### `supportsBackdropFilter()`

Проверяет поддержку `backdrop-filter` в браузере.

```tsx
import { supportsBackdropFilter } from '@/UI/utils';

if (supportsBackdropFilter()) {
  // Использовать blur эффекты
  element.style.backdropFilter = 'blur(20px)';
} else {
  // Fallback для старых браузеров
  element.style.background = 'rgba(0, 0, 0, 0.8)';
}
```

### `debounce(func, wait)`

Создает debounced версию функции.

```tsx
import { debounce } from '@/UI/utils';

const handleSearch = debounce((query: string) => {
  // Выполнится только после 300ms паузы
  performSearch(query);
}, 300);

// При быстром вводе будет вызвана только последняя версия
input.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});
```

### `throttle(func, limit)`

Создает throttled версию функции.

```tsx
import { throttle } from '@/UI/utils';

const handleScroll = throttle(() => {
  // Выполнится максимум раз в 100ms
  updateScrollPosition();
}, 100);

window.addEventListener('scroll', handleScroll);
```

