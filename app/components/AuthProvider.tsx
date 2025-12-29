"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getStoredUser,
  loginMock,
  registerMock,
  logoutMock,
  ensureClientSeedAdmin,
  type User,
  // Import thêm các hàm admin helper nếu cần dùng ở profile
  updateProfile as updateProfileMock,
  changePassword as changePasswordMock,
  listUsers as listUsersMock,
  deleteUser as deleteUserMock,
} from "../../lib/auth";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<User>;
  logout: () => void;
  // Khai báo thêm để dùng ở ProfilePage
  updateProfile: (data: { name?: string }) => Promise<void>;
  changePassword: (oldP: string, newP: string) => Promise<void>;
  listUsers: () => Promise<User[]>;
  deleteUser: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => ({} as User),
  logout: () => {},
  updateProfile: async () => {},
  changePassword: async () => {},
  listUsers: async () => [],
  deleteUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 1. Khôi phục session khi F5
  useEffect(() => {
    const initAuth = () => {
      try {
        // Tạo admin mặc định nếu chưa có
        ensureClientSeedAdmin();
        // Đọc user từ LocalStorage (dùng đúng hàm của lib)
        const u = getStoredUser();
        if (u) {
          setUser(u);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        // QUAN TRỌNG: Luôn báo đã load xong
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // 2. Hàm Login
  async function login(email: string, password: string) {
    // loginMock trong lib đã tự lưu LocalStorage rồi
    const u = await loginMock(email, password);
    setUser(u);
    // Không cần setItem thủ công nữa để tránh lệch key
    router.refresh(); // Refresh để đảm bảo các component khác cập nhật
  }

  // 3. Hàm Register
  async function register(email: string, password: string, name?: string) {
    return await registerMock(email, password, name);
  }

  // 4. Hàm Logout
  function logout() {
    logoutMock(); // Xóa trong LocalStorage
    setUser(null);
    router.push("/login");
  }

  // --- Các hàm phụ trợ cho Profile/Admin ---

  async function updateProfile(data: { name?: string }) {
    if (!user) return;
    const updated = updateProfileMock(user.email, data);
    setUser(updated); // Cập nhật state ngay lập tức
  }

  async function changePassword(oldP: string, newP: string) {
    if (!user) return;
    changePasswordMock(user.email, oldP, newP);
  }

  async function listUsers() {
    return listUsersMock();
  }

  async function deleteUser(email: string) {
    deleteUserMock(email);
    // Nếu xóa chính mình thì logout (đã xử lý trong lib, nhưng update state ở đây cho chắc)
    if (user?.email === email) {
      setUser(null);
      router.push("/login");
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        listUsers,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}