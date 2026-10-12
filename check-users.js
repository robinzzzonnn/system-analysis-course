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

const resultSets = await sql`SELECT user_id, email, password_hash, name FROM users`;
const firstSet = resultSets[0];
const firstRow = firstSet[0];

console.log('Ключи объекта firstRow:', Object.keys(firstRow));
console.log('\nВсе значения через for...in:');
for (const key in firstRow) {
  console.log(`  ${key}:`, firstRow[key]);
}

console.log('\nПрямой доступ:');
console.log('  firstRow.email:', firstRow.email);
console.log('  firstRow.user_id:', firstRow.user_id);
console.log('  firstRow.password_hash:', firstRow.password_hash);
console.log('  firstRow.name:', firstRow.name);

await driver.close();