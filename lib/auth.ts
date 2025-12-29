// lib/auth.ts

export type User = {
  id?: string // Thêm id vì DB thật có id
  email: string
  password?: string // Có thể undefined khi trả về từ API (để bảo mật)
  name?: string
  role: string
}

const AUTH_KEY = "auth_user"

/* ================= Auth Session (Client Side) ================= */

// Hàm này giữ nguyên để UI biết ai đang đăng nhập
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || "null")
  } catch {
    return null
  }
}

// Hàm Login: Gọi API /api/login
export async function loginMock(email: string, password: string): Promise<User> {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Đăng nhập thất bại")
  }

  const user = await res.json()
  
  // Lưu session vào localStorage để giữ đăng nhập ở Client
  localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  return user
}

// Hàm Register: Gọi API /api/register (Bạn cần tạo route này sau)
export async function registerMock(
  email: string,
  password: string,
  name?: string
): Promise<User> {
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Đăng ký thất bại")
  }

  return await res.json()
}

export function logoutMock() {
  localStorage.removeItem(AUTH_KEY)
}

/* ================= Admin Seed ================= */

// Hàm này KHÔNG CẦN THIẾT nữa vì bạn đã chạy "npx prisma db seed" trên server rồi.
// Mình để trống để code cũ gọi vào không bị lỗi.
export function ensureClientSeedAdmin() {
  // Do nothing. Dữ liệu thật đã có trên Neon.
  return
}

/* ================= Admin Helpers (Chuyển sang gọi API) ================= */
// Lưu ý: Các hàm dưới đây cần bạn tạo thêm API Route tương ứng (ví dụ: /api/users)
// Hiện tại mình sẽ viết code gọi API chờ sẵn.

export async function listUsers(): Promise<User[]> {
  // Gọi API lấy danh sách user (Cần tạo file app/api/users/route.ts)
  const res = await fetch("/api/users")
  if (!res.ok) return [] // Hoặc throw error
  return await res.json()
}

export async function updateProfile(email: string, data: { name?: string }) {
  // Gọi API update profile (Cần tạo route)
  // Tạm thời chỉ update ở localStorage để UI phản hồi ngay (Optimistic update)
  const currentUser = getStoredUser()
  if (currentUser?.email === email) {
    const updated = { ...currentUser, ...data }
    localStorage.setItem(AUTH_KEY, JSON.stringify(updated))
    return updated
  }
  return currentUser
}

export async function changePassword(email: string, oldPassword: string, newPassword: string) {
  // Cần tạo API đổi mật khẩu
  throw new Error("Chức năng đổi mật khẩu cần kết nối API Backend")
}

export async function setUserRole(email: string, role: string) {
  // Cần tạo API set role
  const res = await fetch("/api/users/role", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, role }),
  })
  if (!res.ok) throw new Error("Không thể thay đổi quyền")
}

export async function deleteUser(email: string) {
  // Cần tạo API xóa user
  const res = await fetch(`/api/users?email=${email}`, {
    method: "DELETE",
  })
  
  if (!res.ok) throw new Error("Không thể xóa người dùng")

  const current = getStoredUser()
  if (current?.email === email) {
    logoutMock()
  }
}

export async function setPassword(email: string, newPassword: string) {
   // Cần tạo API admin set password
   throw new Error("Chức năng admin đặt lại mật khẩu cần API Backend")
}

// Hàm này không nên dùng ở Client nữa vì lý do bảo mật (API không được trả password về)
export function getUserPassword(email: string) {
  return null
}