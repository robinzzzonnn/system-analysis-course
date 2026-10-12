# Проект: Курс по системному анализу

## Что это
Обучающая платформа для новичков в системном анализе.
5 интерактивных уроков с заданиями, теорией и SVG-схемами.

## Структура
- index.html — главная
- login.html, register.html — авторизация (localStorage)
- dashboard.html — личный кабинет
- lesson.html — страница урока (?id=N)
- usecase-editor.html — конструктор Use Case диаграмм
- lessons.json — весь контент уроков
- css/style.css — стили
- js/main.js — логика
- js/lesson-loader.js — загрузчик урока

## Что уже работает
- 5 уроков с 6 заданиями каждый
- Теория с markdown и SVG
- Конструктор диаграмм
- Прогресс в localStorage

## Что осталось
1. Починить ссылки без .html (не работают на Netlify)
2. Переехать на российский хостинг (Netlify тормозит из РФ)
3. Сделать сайт публичным в Netlify

## Технологии
Чистый HTML/CSS/JS, без фреймворков.

## API
ProxyAPI (провайдер), модель qwen/qwen3-coder.
Ключ в ~/.qwen/settings.json
