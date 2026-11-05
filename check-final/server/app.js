const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Driver } = require('@ydbjs/core');
const { query } = require('@ydbjs/query');
const { ServiceAccountCredentialsProvider } = require('@ydbjs/auth-yandex-cloud');
const { getYdbSql, runWithYdbSql } = require('@rodnoycry/ydb-faas');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

// Регистрация
app.post('/api/register', async (req, res) => {
  // Выбор провайдера аутентификации в зависимости от окружения
  let credentialsProvider;
  if (process.env.NODE_ENV === 'production') {
    // В облаке — метаданные
    const { MetadataCredentialsProvider } = require('@ydbjs/auth/metadata');
    credentialsProvider = new MetadataCredentialsProvider();
  } else {
    // Локально — файл ключа
    credentialsProvider = ServiceAccountCredentialsProvider.fromFile('./authorized_key.json');
  }

  const driver = new Driver(process.env.YDB_CONNECTION_STRING, {
    credentialsProvider,
  });
  try {
    await driver.ready();
    await runWithYdbSql(query(driver), async () => {
      const sql = getYdbSql();
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Заполните все поля' });
      }

      const existingResult = await sql`SELECT user_id, email FROM users WHERE email = ${email}`;
      const existing = existingResult[0] || [];
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email уже зарегистрирован' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = Math.floor(Math.random() * 1000000000);
      const createdAt = new Date();

      await sql`
        INSERT INTO users (user_id, email, password_hash, name, created_at)
        VALUES (${userId}, ${email}, ${passwordHash}, ${name}, ${createdAt})
      `;

      res.json({ success: true, message: 'Пользователь создан' });
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await driver.close();
  }
});

// Вход
app.post('/api/login', async (req, res) => {
  // Выбор провайдера аутентификации в зависимости от окружения
  let credentialsProvider;
  if (process.env.NODE_ENV === 'production') {
    // В облаке — метаданные
    const { MetadataCredentialsProvider } = require('@ydbjs/auth/metadata');
    credentialsProvider = new MetadataCredentialsProvider();
  } else {
    // Локально — файл ключа
    credentialsProvider = ServiceAccountCredentialsProvider.fromFile('./authorized_key.json');
  }

  const driver = new Driver(process.env.YDB_CONNECTION_STRING, {
    credentialsProvider,
  });
  try {
    await driver.ready();
    await runWithYdbSql(query(driver), async () => {
      const sql = getYdbSql();
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Заполните все поля' });
      }

      const result = await sql`SELECT user_id, email, password_hash, name FROM users WHERE email = ${email}`;
      const users = result[0] || [];

      if (users.length === 0) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      const user = users[0];

      if (!user.password_hash) {
        return res.status(500).json({ error: 'Повреждённая запись пользователя' });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      const token = jwt.sign(
        { userId: Number(user.user_id), email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ success: true, token, name: user.name, email: user.email });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await driver.close();
  }
});

// Проверка токена
app.get('/api/me', async (req, res) => {
  // Выбор провайдера аутентификации в зависимости от окружения
  let credentialsProvider;
  if (process.env.NODE_ENV === 'production') {
    // В облаке — метаданные
    const { MetadataCredentialsProvider } = require('@ydbjs/auth/metadata');
    credentialsProvider = new MetadataCredentialsProvider();
  } else {
    // Локально — файл ключа
    credentialsProvider = ServiceAccountCredentialsProvider.fromFile('./authorized_key.json');
  }

  const driver = new Driver(process.env.YDB_CONNECTION_STRING, {
    credentialsProvider,
  });
  try {
    await driver.ready();
    await runWithYdbSql(query(driver), async () => {
      const sql = getYdbSql();
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Нет токена' });

      try {
        const payload = jwt.verify(token, JWT_SECRET);
        res.json({ userId: payload.userId, email: payload.email, name: payload.name });
      } catch (err) {
        res.status(401).json({ error: 'Неверный токен' });
      }
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await driver.close();
  }
});

// Обновление профиля пользователя
app.put('/api/profile', async (req, res) => {
  // Выбор провайдера аутентификации в зависимости от окружения
  let credentialsProvider;
  if (process.env.NODE_ENV === 'production') {
    // В облаке — метаданные
    const { MetadataCredentialsProvider } = require('@ydbjs/auth/metadata');
    credentialsProvider = new MetadataCredentialsProvider();
  } else {
    // Локально — файл ключа
    credentialsProvider = ServiceAccountCredentialsProvider.fromFile('./authorized_key.json');
  }

  const driver = new Driver(process.env.YDB_CONNECTION_STRING, {
    credentialsProvider,
  });
  try {
    await driver.ready();
    await runWithYdbSql(query(driver), async () => {
      const sql = getYdbSql();
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Нет токена' });

      // Проверка токена
      let payload;
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ error: 'Неверный токен' });
      }

      const { name, email } = req.body;

      // Проверка обязательных полей
      if (!name || !email) {
        return res.status(400).json({ error: 'Имя и email обязательны' });
      }

      // Проверка, что email не занят другим пользователем
      const existingResult = await sql`SELECT user_id FROM users WHERE email = ${email} AND user_id != ${payload.userId}`;
      const existing = existingResult[0] || [];
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email уже используется' });
      }

      // Обновление данных пользователя
      await sql`
        UPDATE users
        SET name = ${name}, email = ${email}
        WHERE user_id = ${payload.userId}
      `;

      // Генерация нового JWT-токена с обновлёнными данными
      const newToken = jwt.sign(
        { userId: payload.userId, email: email, name: name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ success: true, name, email, token: newToken });
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await driver.close();
  }
});

module.exports = app;