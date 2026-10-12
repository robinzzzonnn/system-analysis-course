# Статус проекта — 12.10.2026

## Что работает
- Локальный бэкенд (node server/index.js) — авторизация, регистрация, JWT
- YDB — база данных с таблицей users
- Фронтенд (http-server) — подключён к API
- Тестовый пользователь: works@test.com / pass123

## Что сделано для деплоя
- serverless-http установлен
- server/app.js — Express без top-level await
- server/cloud-entry.js — точка входа для Cloud Functions
- @rodnoycry/ydb-faas установлен
- function.zip собран
- Функция system-analysis-api создана в Cloud Functions
- URL: https://functions.yandexcloud.net/d4ee36ludk6n7btnen6l

## Проблема
- Cloud Functions возвращает "no healthy upstream"
- Причина: атака на дата-центры Яндекса (8-11 октября)
- Решение: ждать восстановления инфраструктуры

## Что дальше (когда облако заработает)
1. Проверить функцию: Invoke-RestMethod к /api/me
2. Если работает — заменить localhost:4000 на облачный URL в js/api.js
3. Пересобрать фронтенд, загрузить в Object Storage
4. Проверить сайт из браузера

## Команды для запуска
- Бэкенд: cd C:\Users\Егор\projects\system-analysis && node server/index.js
- Фронтенд: cd C:\Users\Егор\projects\system-analysis && npx http-server -p 3000 -c-1
- Qwen Code: cd C:\Users\Егор\projects\system-analysis && qwen

## Доступы
- YDB: см. .env
- ProxyAPI: см. ~/.qwen/settings.json
- Yandex Cloud: console.yandex.cloud, каталог cloud-robinzzzonkuzya
- Сервисный аккаунт: ydb-backend-sa