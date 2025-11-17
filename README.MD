# Cards Telegram Mini App

Полноценный пример мини-приложения Telegram с фронтендом на React и бекендом на Django.

## Стек

- **Frontend:** React + Vite (TypeScript), styled-components, Zustand, React Router DOM
- **Backend:** Django, Django REST Framework, Simple JWT, Jazzmin, CORS Headers
- **Telegram:** интеграция WebApp, авторизация initData, демо-подключение звёзд

## Быстрый старт

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # по желанию для доступа в Jazzmin
python manage.py runserver
```

Переменные окружения:

- `TELEGRAM_BOT_TOKEN` — токен бота для подписи initData
- `TELEGRAM_PAYMENT_PROVIDER_TOKEN` — токен провайдера платежей для звёзд

### Frontend

```bash
cd frontend
npm install
npm run dev
```

По умолчанию приложение работает в демо-режиме без Telegram. При запуске внутри Telegram WebApp произойдёт авторизация по `initData`, запрос профиля, коллекции и истории выводов.

## Структура

- `backend/` — Django-проект с REST API (`/api/...`)
- `frontend/` — Vite-проект с мини-приложением и тремя экранами: профиль, вывод и коллекция

## Скриншоты

Внешний вид экранов стилизован под предоставленные макеты: градиенты, таббар, карточки коллекции и блок вывода звёзд.
