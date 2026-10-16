# Статус проекта — 16 октября 2026

## Что работает

### Фронтенд
- Главная (index.html)
- Регистрация и вход (register.html, login.html)
- Страница выбора после входа (choose.html) — Курс или Тренажёр
- Личный кабинет (profile.html) — смена имени и email
- Курс (dashboard.html, lesson.html) — 5 уроков
- Тренажёр (simulator.html, simulator-run.html) — 12-этапный симулятор
- Конструктор Use Case (usecase-editor.html)
- Тёмная тема, навигация, стили

### Бэкенд
- Express-сервер (server/app.js, server/index.js)
- POST /api/register — регистрация
- POST /api/login — вход с JWT
- GET /api/me — проверка токена
- PUT /api/profile — обновление профиля
- YDB как база данных (пользователи)
- bcrypt для паролей, CORS

### Инфраструктура
- Локально: node server/index.js (4000) + npx http-server -p 3000 -c-1
- GitHub: github.com/robinzzzonnn/system-analysis-course
- Netlify: system-analysis-course.netlify.app (старая версия)
- Yandex Cloud: Cloud Function system-analysis-api (не работает — авария)

## Известные проблемы

1. **Разлогин при переходе на главную** после смены имени в профиле
   - Где: index.html / js/api.js / server/app.js
   - Приоритет: высокий

2. **Контент курса и тренажёра доступен без авторизации**
   - Где: lessons.json, simulators.json в корне проекта
   - Приоритет: высокий
   - Решение: перенести в YDB, отдавать через API с JWT

3. **Yandex Cloud в аварийном режиме**
   - Cloud Functions, YDB, Object Storage
   - Приоритет: средний
   - Решение: ждать восстановления

4. **На Netlify старая версия фронтенда**
   - Без тренажёра и профиля
   - Приоритет: низкий

## Планы

### Ближайшие
1. Дождаться восстановления Yandex Cloud:
   - Пересобрать function.zip с новым бэкендом
   - Задеплоить Cloud Function
   - Обновить фронтенд в Object Storage
   - Заменить localhost:4000 на облачный URL в js/api.js
2. Починить разлогин
3. Защитить контент (перенести в YDB)

### Средние
4. Добавить второй тренажёр
5. Улучшить UX тренажёра
6. Купить домен itsystem-analysis.ru
7. Настроить HTTPS

### Далеко идущие
8. Удалить уроки (если фокус только на тренажёре)
9. Монетизация — платный доступ
10. Больше тренажёров (5-10 сценариев)

## Доступы

- Папка: C:\Users\Егор\projects\system-analysis
- GitHub: github.com/robinzzzonnn/system-analysis-course
- Netlify: system-analysis-course.netlify.app
- Yandex Cloud: console.yandex.cloud, каталог cloud-robinzzzonkuzya
- Cloud Function URL: https://functions.yandexcloud.net/d4ee36ludk6n7btnen6l
- Сервисный аккаунт: ydb-backend-sa
- YDB: см. .env (YDB_CONNECTION_STRING)
- JWT_SECRET: k7Xm9pLq2vN8sW4zR6tY1uB3cE5hJ0aD
- ProxyAPI: см. ~/.qwen/settings.json
- Тестовый пользователь: works@test.com / pass123

## Команды

### Бэкенд
cd C:\Users\Егор\projects\system-analysis
node server/index.js

### Фронтенд
cd C:\Users\Егор\projects\system-analysis
npx http-server -p 3000 -c-1

### Qwen Code
cd C:\Users\Егор\projects\system-analysis
qwen

### Git
cd C:\Users\Егор\projects\system-analysis
git add .
git commit -m "Что сделал"
git push

### Сайт локально
http://127.0.0.1:3000/index.html

## Важно помнить

1. Два сервера одновременно: бэкенд (4000) + фронтенд (3000)
2. npx serve ломает query-параметры — используйте только http-server
3. Qwen Code склонен «залипать» — перезапускать с явным «НОВАЯ ЗАДАЧА»
4. Backup перед правками: Copy-Item файл файл.backup
5. Секреты не в Git: authorized_key.json, .env, node_modules/