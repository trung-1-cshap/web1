"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  getStoredUser,
  loginMock,
  registerMock,
  logoutMock,
  listUsers,
  updateProfile,
  changePassword,
  setUserRole,
  deleteUser,
  setPassword,
  ensureClientSeedAdmin,
  type User,
} from "../../lib/auth"

type AuthContext = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<User>
  logout: () => void
}

const ctx = createContext<AuthContext | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    ensureClientSeedAdmin() // chỉ tạo admin, KHÔNG login
    const u = getStoredUser()
    if (u) setUser(u)
  }, [])

  async function login(email: string, password: string) {
    const u = await loginMock(email, password)
    setUser(u)
  }

  async function register(email: string, password: string, name?: string) {
    const u = await registerMock(email, password, name)
    return u
  }

  function logout() {
    logoutMock()
    setUser(null)
  }

  return (
    <ctx.Provider value={{ user, login, register, logout }}>
      {children}
    </ctx.Provider>
  )
}

export function useAuth() {
  const v = useContext(ctx)
  if (!v) throw new Error("useAuth must be used inside AuthProvider")
  return v
}
