"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getStoredUser,
  loginMock,
  registerMock,
  logoutMock,
  ensureClientSeedAdmin,
  type User,
} from "../../lib/auth";

type AuthContext = {
  user: User | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // ✅ CHỈ CHẠY 1 LẦN KHI LOAD TRANG / F5
  useEffect(() => {
    ensureClientSeedAdmin();
    const u = getStoredUser(); // đọc localStorage
    if (u) setUser(u);
    setHydrated(true);
  }, []);

  async function login(email: string, password: string) {
    const u = await loginMock(email, password);
    setUser(u);
  }

  async function register(email: string, password: string, name?: string) {
    const u = await registerMock(email, password, name);
    return u;
  }

  function logout() {
    logoutMock();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, hydrated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
