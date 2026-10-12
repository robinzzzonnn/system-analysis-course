import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Driver } from '@ydbjs/core';
import { query } from '@ydbjs/query';
import { ServiceAccountCredentialsProvider } from '@ydbjs/auth-yandex-cloud';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const connectionString = process.env.YDB_CONNECTION_STRING;
const driver = new Driver(connectionString, {
  credentialsProvider: ServiceAccountCredentialsProvider.fromFile('./authorized_key.json'),
});
await driver.ready();
const sql = query(driver);

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

// Регистрация
app.post('/api/register', async (req, res) => {
  try {
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
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Вход
app.post('/api/login', async (req, res) => {
  try {
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
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Проверка токена
app.get('/api/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Нет токена' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ userId: payload.userId, email: payload.email, name: payload.name });
  } catch (err) {
    res.status(401).json({ error: 'Неверный токен' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});