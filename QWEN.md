# Проект: Платформа для системных аналитиков (Курс + Тренажёр)

## Архитектура
- **Фронтенд:** HTML, CSS, JS (без фреймворков). Хранится в Yandex Object Storage. Адрес: http://system-analysis-course.website.yandexcloud.net
- **Бэкенд:** Node.js + Express. Развёрнут в Yandex Cloud Functions (функция system-analysis-api-v2).
- **API Gateway:** Yandex API Gateway (d5dtqdjvma0bj8jn8kdr.4kscn31j.apigw.yandexcloud.net) — принимает запросы и передаёт их в функцию. В спецификации прописаны пути: /api/me, /api/login, /api/register, /api/profile.
- **База данных:** Yandex YDB (Serverless).

## Локальные файлы
- `index.html` — главная (редиректит на choose.html, если есть токен).
- `choose.html` — выбор между Курсом и Тренажёром.
- `dashboard.html`, `lesson.html`, `lessons.json` — Курс.
- `simulator.html`, `simulator-run.html`, `simulators.json` — Тренажёр (12 этапов).
- `profile.html` — личный кабинет.
- `css/style.css` — все стили.
- `js/api.js` — клиент для работы с API (уже настроен на API Gateway).
- `js/main.js` — логика страниц.

## Локальный бэкенд (для справки)
- Папка `server/` (сейчас удалена из Git, но может понадобиться для правок).
- Точка входа для облака: `server/cloud-entry.handler` (CommonJS).

## Особенности
- Не используем `npx serve` (он ломает query-параметры), только `http-server`.
- В `index.html` убрана проверка авторизации, вместо неё — редирект на choose.html при наличии токена.

## Важно
- Секреты (.env, authorized_key.json) не хранить в Git.
- Для деплоя бэкенда использовать `yc serverless function version create`.