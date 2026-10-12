import { Driver } from '@ydbjs/core';
import { query } from '@ydbjs/query';
import { ServiceAccountCredentialsProvider } from '@ydbjs/auth-yandex-cloud';
import dotenv from 'dotenv';
dotenv.config();

const driver = new Driver(process.env.YDB_CONNECTION_STRING, {
  credentialsProvider: ServiceAccountCredentialsProvider.fromFile('./authorized_key.json'),
});
await driver.ready();
const sql = query(driver);

const email = 'test-param@test.com';
const userId = 1234567890;  // маленькое число
const passwordHash = 'test-hash';
const name = 'Тест';
const createdAt = new Date();

console.log('3. INSERT с приведением типов...');
try {
  await sql`
    INSERT INTO users (user_id, email, password_hash, name, created_at)
    VALUES (
      CAST(${userId} AS Uint64),
      CAST(${email} AS Utf8),
      CAST(${passwordHash} AS Utf8),
      CAST(${name} AS Utf8),
      CAST(${createdAt} AS Timestamp)
    )
  `;
  console.log('   ✅ ОК');
} catch (e) {
  console.log('   ❌ Ошибка:', e.message);
}

await driver.close();