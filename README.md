## Структура
- `тестовое_задание/tech-int3-server` — API-сервер
- `client` — клиент-сервер

## Запуск локально
### Backend
```bash
cd тестовое_задание/tech-int3-server
npm install
npm start
```
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
client — http://localhost:5173
server — http://localhost:3001/api/v1

## Тестирование
cd client
npm test

Тесты: `src/features/ads/RejectModal.test.tsx`.
Страница `/list`:
  - Горячие клавиши: `/` — поиск, `←`/`→` — смена страницы, `A` — массовое одобрение, `D` — массовое отклонение (с snackbar-подсказками).