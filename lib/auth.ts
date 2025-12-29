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
  // So sánh email không phân biệt hoa thường
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
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
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Email đã tồn tại")
  }

  const newUser: User = {
    email,
    password,
    name,
    role: "user", // Mặc định là user thường
  }

  users.push(newUser)
  saveUsers(users)

  return newUser
}

export function logoutMock() {
  localStorage.removeItem(AUTH_KEY)
}

/* ================= Admin seed (TẠO 3 ADMIN MẶC ĐỊNH) ================= */

export function ensureClientSeedAdmin() {
  if (typeof window === "undefined") return

  const users = getUsers()
  let hasChange = false

  // Danh sách 3 admin cần cấp
  const adminsToSeed = [
    { email: "NguyenDuyAn@gmail.com", name: "Nguyễn Duy An" },
    { email: "Trung@gmail.com", name: "Trung" },
    { email: "Vinh@gmail.com", name: "Vinh" },
  ]

  adminsToSeed.forEach((seed) => {
    // Tìm xem email đã tồn tại chưa (không phân biệt hoa thường)
    const idx = users.findIndex(u => u.email.toLowerCase() === seed.email.toLowerCase())

    if (idx === -1) {
      // Chưa có -> Tạo mới làm Admin
      users.push({
        email: seed.email,
        password: "admin@123",
        name: seed.name,
        role: "admin", // Role chữ thường để khớp logic check
      })
      hasChange = true
    } else {
      // Đã có -> Cập nhật lại Role thành admin và Password mặc định
      const u = users[idx]
      // Nếu chưa phải admin hoặc pass khác thì cập nhật lại
      if (u.role !== "admin" || u.password !== "admin@123") {
        users[idx] = { ...u, role: "admin", password: "admin@123" }
        hasChange = true
      }
    }
  })

  if (hasChange) {
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

  // Cập nhật cả session hiện tại nếu đúng là người đang login
  const currentUser = getStoredUser()
  if (currentUser?.email === email) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(users[idx]))
  }
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

// Hàm getUserPassword (đã thêm lại để không bị lỗi nếu lỡ code cũ còn gọi)
export function getUserPassword(email: string) {
  const users = getUsers()
  const user = users.find((u) => u.email === email)
  return user ? user.password : null
}