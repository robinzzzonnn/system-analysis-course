import bcrypt from 'bcrypt';

const password = 'test123';
console.log('Начинаю хэширование...');
const hash = await bcrypt.hash(password, 10);
console.log('Хэш:', hash);
console.log('Длина:', hash.length);
console.log('Начинаю проверку...');
const ok = await bcrypt.compare(password, hash);
console.log('Проверка:', ok);