type StoredUser = {
  id: string;
  email: string;
  password: string; // plain for mock
  name?: string;
  role?: string;
};

type User = {
  id: string;
  email: string;
  name?: string;
  role?: string;
};

const USERS_KEY = 'mock_users';
const CURRENT_KEY = 'mock_user';

// helper cookie (phía client)
function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (!match) return null;
  try { return decodeURIComponent(match[2]); } catch { return match[2]; }
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

// bộ kiểm tra (validators)
const gmailRegex = /^[^\s@]+@gmail\.com$/i;
const strongPassRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredUser[];
  } catch (e) {
    return [];
  }
}

function writeUsers(list: StoredUser[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  } catch (e) {}
}

export async function loginMock(email: string, password: string): Promise<User> {
  if (!email || !password) throw new Error('Invalid credentials');
  if (!gmailRegex.test(email)) throw new Error('Email must be a gmail.com address');
  if (!strongPassRegex.test(password)) throw new Error('Password must include letters, numbers and a special character');
  const users = readUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!found || found.password !== password) throw new Error('Email or password incorrect');
  const publicUser: User = { id: found.id, email: found.email, name: found.name, role: found.role };
  try { setCookie(CURRENT_KEY, JSON.stringify(publicUser), 7); } catch (e) {}
  return Promise.resolve(publicUser);
}

export async function registerMock(email: string, password: string, name?: string): Promise<User> {
  if (!email || !password) throw new Error('Invalid registration');
  if (!gmailRegex.test(email)) throw new Error('Email must be a gmail.com address');
  if (!strongPassRegex.test(password)) throw new Error('Password must include letters, numbers and a special character');
  const users = readUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email already registered');
  }
  const id = 'u' + Date.now();
  const resolvedName = name ?? email.split('@')[0];
  const newUser: StoredUser = { id, email, password, name: resolvedName, role: 'user' };
  users.unshift(newUser);
  writeUsers(users);
  const publicUser: User = { id, email, name: resolvedName, role: 'user' };
  try {
    // Only set the current-user cookie when there's no existing session.
    // This preserves the common registration flow (sign-in after register)
    // but prevents an already-authenticated admin from being signed out
    // when they create another account via admin UI.
    const existing = getCookie(CURRENT_KEY);
    if (!existing) setCookie(CURRENT_KEY, JSON.stringify(publicUser), 7);
  } catch (e) {}
  return Promise.resolve(publicUser);
}

export function logoutMock() {
  try { deleteCookie(CURRENT_KEY); } catch (e) {}
}

export function getStoredUser(): User | null {
  try {
    const raw = getCookie(CURRENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch (e) {
    return null;
  }
}

export type { User };

// --- Quản lý người dùng mock bổ sung ---

export function listUsers(): User[] {
  const users = readUsers();
  return users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role }));
}

export function updateProfile(email: string, data: { name?: string }): User {
  const users = readUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) throw new Error('User not found');
  users[idx] = { ...users[idx], ...data };
  writeUsers(users);
  const publicUser = { id: users[idx].id, email: users[idx].email, name: users[idx].name, role: users[idx].role };
  try { setCookie(CURRENT_KEY, JSON.stringify(publicUser), 7); } catch (e) {}
  return publicUser;
}

export function changePassword(email: string, oldPassword: string, newPassword: string) {
  const users = readUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) throw new Error('User not found');
  if (users[idx].password !== oldPassword) throw new Error('Old password incorrect');
  users[idx].password = newPassword;
  writeUsers(users);
}

export function setUserRole(targetEmail: string, role: string) {
  const users = readUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === targetEmail.toLowerCase());
  if (idx === -1) throw new Error('User not found');
  users[idx].role = role;
  writeUsers(users);
}

export function deleteUser(targetEmail: string) {
  const users = readUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === targetEmail.toLowerCase());
  if (idx === -1) throw new Error('User not found');
  users.splice(idx, 1);
  writeUsers(users);
  try { const cur = getCookie(CURRENT_KEY); if (cur) { const parsed = JSON.parse(cur); if (parsed && parsed.email && parsed.email.toLowerCase() === targetEmail.toLowerCase()) deleteCookie(CURRENT_KEY); } } catch (e) {}
}

export function setPassword(targetEmail: string, newPassword: string) {
  if (!newPassword) throw new Error('Invalid password');
  const users = readUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === targetEmail.toLowerCase());
  if (idx === -1) throw new Error('User not found');
  users[idx].password = newPassword;
  writeUsers(users);
}

export function getUserPassword(targetEmail: string): string | null {
  try {
    const users = readUsers();
    const u = users.find(x => x.email.toLowerCase() === targetEmail.toLowerCase());
    return u ? u.password : null;
  } catch (e) {
    return null;
  }
}

// Helper phía client: đảm bảo admin tồn tại và thiết lập cookie/localStorage khi chạy trong trình duyệt
export function ensureClientSeedAdmin() {
  if (typeof window === 'undefined') return;
  try {
    const email = 'NguyenDuyAn@gmail.com';
    const users = readUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) {
      const seed = {
        id: 'u_admin_' + Date.now(),
        email,
        password: 'Admin@123',
        name: 'Nguyen Duy An',
        role: 'admin',
      } as StoredUser;
      users.unshift(seed);
      writeUsers(users);
      try { setCookie(CURRENT_KEY, JSON.stringify({ id: seed.id, email: seed.email, name: seed.name, role: seed.role }), 7); } catch (e) {}
    } else if (users[idx].role !== 'admin') {
      users[idx].role = 'admin';
      writeUsers(users);
      try { setCookie(CURRENT_KEY, JSON.stringify({ id: users[idx].id, email: users[idx].email, name: users[idx].name, role: users[idx].role }), 7); } catch (e) {}
    }
  } catch (e) {
    // bỏ qua
  }
}

  // Đảm bảo tài khoản admin yêu cầu tồn tại (hoặc được nâng cấp).
;(function ensureSeedAdmin() {
  try {
    const email = 'NguyenDuyAn@gmail.com';
    const users = readUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) {
      // thêm admin mẫu với mật khẩu mặc định (chỉ mock)
      const seed = {
        id: 'u_admin_' + Date.now(),
        email,
        password: 'Admin@123',
        name: 'Nguyen Duy An',
        role: 'admin',
      } as StoredUser;
      users.unshift(seed);
      writeUsers(users);
      try { setCookie(CURRENT_KEY, JSON.stringify({ id: seed.id, email: seed.email, name: seed.name, role: seed.role }), 7); } catch (e) {}
    } else if (users[idx].role !== 'admin') {
      users[idx].role = 'admin';
      writeUsers(users);
      try { setCookie(CURRENT_KEY, JSON.stringify({ id: users[idx].id, email: users[idx].email, name: users[idx].name, role: users[idx].role }), 7); } catch (e) {}
    }
  } catch (e) {
    // bỏ qua lỗi seed trong môi trường không phải trình duyệt
  }
})();
