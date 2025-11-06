# UI Компоненты K-Connect Music

Библиотека переиспользуемых UI компонентов для проекта K-Connect Music.

## Структура

```
UI/
├── components/     # React компоненты
│   ├── Button/     # Кнопки
│   ├── Input/       # Поля ввода
│   └── Card/        # Карточки
├── utils/          # Утилиты для UI
└── index.ts        # Экспорт всех компонентов
```

## Использование

### Импорт компонентов

```tsx
import { Button, Input, Card } from '@/UI';
```

### Button

Кнопка с различными вариантами и размерами.

```tsx
import { Button } from '@/UI';

// Основная кнопка
<Button variant="primary" size="medium">
  Нажми меня
</Button>

// Кнопка с загрузкой
<Button variant="primary" loading={isLoading}>
  Сохранить
</Button>

// Кнопка на всю ширину
<Button variant="secondary" fullWidth>
  Полная ширина
</Button>
```

**Варианты:**
- `primary` - основная кнопка с градиентом
- `secondary` - вторичная кнопка
- `outline` - кнопка с обводкой
- `ghost` - прозрачная кнопка
- `danger` - кнопка для опасных действий

**Размеры:**
- `small` - маленькая
- `medium` - средняя (по умолчанию)
- `large` - большая

### Input

Поле ввода с поддержкой label, error и helper text.

```tsx
import { Input } from '@/UI';

// Базовое поле
<Input
  type="text"
  placeholder="Введите имя"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// С лейблом и ошибкой
<Input
  label="Email"
  type="email"
  value={email}
  error={errors.email}
  onChange={(e) => setEmail(e.target.value)}
/>

// С подсказкой
<Input
  label="Пароль"
  type="password"
  helperText="Минимум 8 символов"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

### Card

Карточка для группировки контента.

```tsx
import { Card } from '@/UI';

// Базовая карточка
<Card>
  <h2>Заголовок</h2>
  <p>Содержимое карточки</p>
</Card>

// Карточка с вариантами
<Card variant="elevated" padding="large">
  Контент с большими отступами
</Card>
```

**Варианты:**
- `default` - стандартная карточка
- `elevated` - с тенью
- `outlined` - с обводкой

**Отступы:**
- `none` - без отступов
- `small` - маленькие
- `medium` - средние (по умолчанию)
- `large` - большие

## Утилиты

```tsx
import { cn, getThemeVar, supportsBackdropFilter } from '@/UI/utils';

// Объединение классов
const className = cn('base-class', condition && 'conditional-class', undefined);

// Получение CSS переменной
const primaryColor = getThemeVar('--theme-main-color', '#D0BCFF');

// Проверка поддержки backdrop-filter
if (supportsBackdropFilter()) {
  // Использовать blur эффекты
}
```

## Стили

Все компоненты используют CSS переменные из `styles/theme.css`:

- `--theme-background` - фон компонентов
- `--theme-text-primary` - основной цвет текста
- `--theme-button-main` - цвет основной кнопки
- `--main-border-radius` - основной радиус скругления
- И другие...

## Темы

Поддерживаются различные темы через атрибут `data-theme`:

- `default` - стандартная темная тема
- `blur` - с эффектом размытия
- `amoled` - черная тема
- `light` - светлая тема
- И другие...

```html
<html data-theme="blur">
  <!-- Компоненты автоматически адаптируются -->
</html>
```

