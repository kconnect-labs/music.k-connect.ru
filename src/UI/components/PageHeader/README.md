# PageHeader

Переиспользуемый компонент для заголовков страниц.

## Использование

```tsx
import { PageHeader } from '../../UI';

// Базовое использование
<PageHeader
  title="Популярное"
  subtitle="Самая популярная музыка на этой неделе"
/>

// С дополнительным контентом
<PageHeader
  title="Мой плейлист"
  subtitle="20 треков"
>
  <Badge>Новый</Badge>
</PageHeader>

// С действием (кнопкой)
<PageHeader
  title="Настройки"
  subtitle="Управление аккаунтом"
  action={
    <Button onClick={handleSave}>Сохранить</Button>
  }
/>

// Центрированный вариант
<PageHeader
  title="О нас"
  subtitle="Информация о сервисе"
  className="page-header--center"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | **required** | Основной заголовок страницы |
| `subtitle` | `string` | `undefined` | Подзаголовок (опционально) |
| `action` | `React.ReactNode` | `undefined` | Дополнительные элементы справа (кнопки, иконки и т.д.) |
| `children` | `React.ReactNode` | `undefined` | Дополнительный контент под подзаголовком |
| `className` | `string` | `''` | Дополнительные CSS классы |

## Варианты выравнивания

- По умолчанию: левое выравнивание
- `page-header--center`: центрированное выравнивание
- `page-header--left`: левое выравнивание (по умолчанию)

## Адаптивность

Компонент автоматически адаптируется для мобильных устройств:
- Уменьшается размер заголовка
- Элементы располагаются вертикально
- Оптимизированы отступы

