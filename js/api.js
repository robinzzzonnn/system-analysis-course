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

async function apiUpdateProfile(name, email) {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name, email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Ошибка обновления');

  // Обновить токен в localStorage, если он был возвращён
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
  }

  // Обновить данные пользователя
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  user.name = data.name;
  user.email = data.email;
  localStorage.setItem('user', JSON.stringify(user));
  
  // Also update the legacy user info storage for backward compatibility
  localStorage.setItem('userName', data.name);
  localStorage.setItem('userEmail', data.email);
  localStorage.setItem('isLoggedIn', 'true');
  
  return data;
}