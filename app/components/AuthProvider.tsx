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
  // Import các hàm từ lib/auth
  updateProfile as updateProfileMock,
  changePassword as changePasswordMock,
  listUsers as listUsersMock,
  deleteUser as deleteUserMock,
  setUserRole as setUserRoleMock, // 👈 Thêm cái này
  setPassword as setPasswordMock, // 👈 Thêm cái này
} from "../../lib/auth";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<User>;
  logout: () => void;
  updateProfile: (data: { name?: string }) => Promise<void>;
  changePassword: (oldP: string, newP: string) => Promise<void>;
  listUsers: () => Promise<User[]>;
  deleteUser: (email: string) => Promise<void>;
  // 👇 Khai báo thêm 2 hàm bị thiếu
  setUserRole: (email: string, role: string) => Promise<void>;
  setPassword: (email: string, newPass: string) => Promise<void>;
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
  setUserRole: async () => {},
  setPassword: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = () => {
      try {
        ensureClientSeedAdmin();
        const u = getStoredUser();
        if (u) {
          setUser(u);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  async function login(email: string, password: string) {
    const u = await loginMock(email, password);
    setUser(u);
    router.refresh(); 
  }

  async function register(email: string, password: string, name?: string) {
    return await registerMock(email, password, name);
  }

  function logout() {
    logoutMock();
    setUser(null);
    router.push("/login");
  }

  async function updateProfile(data: { name?: string }) {
    if (!user) return;
    const updated = await updateProfileMock(user.email, data);
    setUser(updated);
  }

  async function changePassword(oldP: string, newP: string) {
    if (!user) return;
    await changePasswordMock(user.email, oldP, newP);
  }

  async function listUsers() {
    return listUsersMock();
  }

  async function deleteUser(email: string) {
    deleteUserMock(email);
    if (user?.email === email) {
      setUser(null);
      router.push("/login");
    }
  }

  // 👇 Triển khai 2 hàm bị thiếu
  async function setUserRole(email: string, role: string) {
    setUserRoleMock(email, role);
  }

  async function setPassword(email: string, newPass: string) {
    setPasswordMock(email, newPass);
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
        setUserRole, // 👈 Đưa vào context
        setPassword, // 👈 Đưa vào context
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