import { Driver } from '@ydbjs/core';
import { query } from '@ydbjs/query';
import { ServiceAccountCredentialsProvider } from '@ydbjs/auth-yandex-cloud';

// Замените на свои значения
const connectionString = 'grpcs://ydb.serverless.yandexcloud.net:2135/?database=/ru-central1/b1gcieqo1k5tkg6haqff/etn7mmg7n42nkfaujq77';

const driver = new Driver(connectionString, {
  credentialsProvider: ServiceAccountCredentialsProvider.fromFile('./authorized_key.json'),
});

await driver.ready();

// Создаём функцию-обёртку для выполнения запросов
const sql = query(driver);

try {
  // Выполняем запрос через tagged template
  await sql`
    CREATE TABLE users (
      user_id Uint64,
      email Utf8,
      password_hash Utf8,
      name Utf8,
      created_at Timestamp,
      PRIMARY KEY (user_id)
    );
  `;
  console.log('✅ Таблица users создана');
} catch (err) {
  console.error('❌ Ошибка:', err.message);
} finally {
  await driver.close();
}