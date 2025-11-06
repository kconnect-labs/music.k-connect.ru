# music.k-connect.ru

Музыкальная платформа на базе K-Connect API.

## Установка

```bash
npm install
```

## Запуск в режиме разработки

```bash
npm run dev
```

Проект будет доступен на `http://localhost:3006`

## Сборка

```bash
npm run build
```

## Структура проекта

```
frontend-music/
├── src/
│   ├── components/      # React компоненты
│   ├── context/        # React контексты (AuthContext)
│   ├── pages/          # Страницы приложения
│   ├── services/       # Сервисы для работы с API
│   ├── App.tsx         # Главный компонент
│   └── main.tsx        # Точка входа
├── index.html
├── package.json
└── vite.config.js
```
## Хотелось бы
Хотелось бы написать новый FullScreenPlayer чтобы удалить полностью MUI из проекта, он просто был скопирован из основного коннекта, за счет этого проект собирается не за 1 секунду, а за 9 и впринципе тяжелее. Буду рад форку с новым FSP!

## Интеграция с K-Connect API

Проект использует API k-connect для аутентификации:
- `/api/auth/login` - вход в систему
- `/api/auth/check` - проверка авторизации
- `/api/auth/logout` - выход из системы

Все запросы к API проксируются через Vite dev server на `https://k-connect.ru`.

## Поддомен

Проект настроен для работы на поддомене `music.k-connect.ru`.
