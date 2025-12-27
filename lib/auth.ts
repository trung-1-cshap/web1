export type User = {
  email: string
  password: string
  name?: string
  role: string
}

const USERS_KEY = "users"
const AUTH_KEY = "auth_user"

/* ================= Utils ================= */

function getUsers(): User[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]")
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

/* ================= Auth ================= */

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  return JSON.parse(localStorage.getItem(AUTH_KEY) || "null")
}

export async function loginMock(email: string, password: string): Promise<User> {
  const users = getUsers()
  const user = users.find(
    (u) => u.email === email && u.password === password
  )
  if (!user) throw new Error("Sai email hoặc mật khẩu")

  localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  return user
}

export async function registerMock(
  email: string,
  password: string,
  name?: string
): Promise<User> {
  const users = getUsers()
  if (users.some((u) => u.email === email)) {
    throw new Error("Email đã tồn tại")
  }

  const newUser: User = {
    email,
    password,
    name,
    role: "ACCOUNTANT",
  }

  users.push(newUser)
  saveUsers(users)

  return newUser
}

export function logoutMock() {
  localStorage.removeItem(AUTH_KEY)
}

/* ================= Admin seed (CHỈ TẠO USER, KHÔNG LOGIN) ================= */

export function ensureClientSeedAdmin() {
  if (typeof window === "undefined") return

  const users = getUsers()
  const hasAdmin = users.some((u) => u.role === "ADMIN")

  if (!hasAdmin) {
    users.push({
      email: "NguyenDuyAN@gmail.com",
      password: "admin@123",
      name: "Admin",
      role: "ADMIN",
    })
    saveUsers(users)
  }
}

/* ================= Admin helpers ================= */

export function listUsers(): User[] {
  return getUsers()
}

export function updateProfile(email: string, data: { name?: string }) {
  const users = getUsers()
  const idx = users.findIndex((u) => u.email === email)
  if (idx === -1) throw new Error("User not found")

  users[idx] = { ...users[idx], ...data }
  saveUsers(users)

  localStorage.setItem(AUTH_KEY, JSON.stringify(users[idx]))
  return users[idx]
}

export function changePassword(
  email: string,
  oldPassword: string,
  newPassword: string
) {
  const users = getUsers()
  const user = users.find((u) => u.email === email)
  if (!user || user.password !== oldPassword)
    throw new Error("Mật khẩu cũ không đúng")

  user.password = newPassword
  saveUsers(users)
}

export function setUserRole(email: string, role: string) {
  const users = getUsers()
  const user = users.find((u) => u.email === email)
  if (!user) throw new Error("User not found")
  user.role = role
  saveUsers(users)
}

export function deleteUser(email: string) {
  const users = getUsers().filter((u) => u.email !== email)
  saveUsers(users)

  const current = getStoredUser()
  if (current?.email === email) {
    logoutMock()
  }
}

export function setPassword(email: string, newPassword: string) {
  const users = getUsers()
  const user = users.find((u) => u.email === email)
  if (!user) throw new Error("User not found")
  user.password = newPassword
  saveUsers(users)
}
