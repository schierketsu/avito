Локальный проект для выполнения тестового задания Авито: система модерации объявлений.

## Структура

- `тестовое_задание/tech-int3-server` — готовый API-сервер (Node.js/Express).
- `client` — SPA на React 18 + TypeScript + Vite.

## Запуск локально

### Backend

```bash
cd тестовое_задание/tech-int3-server
npm install
npm start
```

Сервер поднимется на `http://localhost:3001/api/v1`.

### Frontend

```bash
cd client
npm install
# создайте .env с переменной:
# VITE_API_BASE_URL=http://localhost:3001/api/v1
npm run dev
```

Клиент будет доступен на `http://localhost:5173` (или `http://localhost:3000`, если изменить порт в `vite.config.ts`).

## Запуск через Docker Compose

```bash
docker compose up --build
```

- `client` — `http://localhost:3000`
- `server` — `http://localhost:3001/api/v1`

Во фронтенд-образе переменная `VITE_API_BASE_URL` уже указана как `http://server:3001/api/v1`.

## Тестирование

Фронтенд использует Vitest + React Testing Library.

```bash
cd client
npm test
```

Пример тестов: `src/features/ads/RejectModal.test.tsx`.

## Стек и ключевые решения

- **Frontend**: React 18, TypeScript, Vite, React Router, React Query, MUI, Recharts.
- **Backend**: предоставленный Express-сервер по спецификации OpenAPI (`schema.yaml`).
- **Функционал**:
  - `/list` — список объявлений с фильтрами, сортировкой, пагинацией, bulk-операциями и горячими клавишами.
  - `/item/:id` — детальный просмотр с галереей, продавцом, историей модерации и действиями модератора.
  - `/stats` — статистика модерации с периодами, карточками метрик и графиками, экспортом CSV/PDF.


