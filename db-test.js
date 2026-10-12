import { Driver } from '@ydbjs/core';
import { ServiceAccountCredentialsProvider } from '@ydbjs/auth-yandex-cloud';

// Замените на свои значения из консоли YDB
const connectionString = 'grpcs://ydb.serverless.yandexcloud.net:2135/?database=/ru-central1/b1gcieqo1k5tkg6haqff/etn7mmg7n42nkfaujq77';

const driver = new Driver(connectionString, {
  credentialsProvider: ServiceAccountCredentialsProvider.fromFile('./authorized_key.json'),
});

try {
  await driver.ready();
  console.log('✅ Подключение к YDB прошло успешно!');
} catch (err) {
  console.error('❌ Ошибка подключения:', err.message);
} finally {
  await driver.close();
}