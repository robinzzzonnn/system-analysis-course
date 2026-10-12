const API_URL = 'http://localhost:4000';

function saveToken(token, user) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function getToken() {
  return localStorage.getItem('auth_token');
}

function clearAuth() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
}

async function apiRegister(email, password, name) {
  const response = await fetch(API_URL + '/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Ошибка регистрации');
  return data;
}

async function apiLogin(email, password) {
  const response = await fetch(API_URL + '/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Ошибка входа');
  return data;
}

async function apiGetMe() {
  const token = getToken();
  if (!token) return null;
  try {
    const response = await fetch(API_URL + '/api/me', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
    });
    if (!response.ok) {
      clearAuth();
      return null;
    }
    return await response.json();
  } catch (err) {
    console.error('Ошибка проверки токена:', err);
    clearAuth();
    return null;
  }
}