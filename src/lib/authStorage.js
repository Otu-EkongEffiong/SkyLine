const AUTH_KEY = 'skyline_auth_user';

export function loadAuthUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuthUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_KEY);
}

export function registerUser({ email, password, name }) {
  const users = loadUsers();
  if (users.find((u) => u.email === email)) {
    throw new Error('An account with this email already exists.');
  }
  const user = {
    id: crypto.randomUUID(),
    email,
    name,
    password,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  localStorage.setItem('skyline_users', JSON.stringify(users));
  const session = { id: user.id, email: user.email, name: user.name };
  saveAuthUser(session);
  return session;
}

export function loginUser({ email, password }) {
  const user = loadUsers().find((u) => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid email or password.');
  const session = { id: user.id, email: user.email, name: user.name };
  saveAuthUser(session);
  return session;
}

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem('skyline_users') || '[]');
  } catch {
    return [];
  }
}
