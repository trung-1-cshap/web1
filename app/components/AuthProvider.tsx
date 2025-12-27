"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
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
} from "../../lib/auth";

type AuthContext = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name?: string
  ) => Promise<User | void>;
  updateProfile: (data: { name?: string }) => Promise<void>;
  changePassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<void>;
  listUsers: () => Promise<User[]>;
  setUserRole: (email: string, role: string) => Promise<void>;
  deleteUser: (email: string) => Promise<void>;
  setPassword: (email: string, newPassword: string) => Promise<void>;
  logout: () => void;
};

const ctx = createContext<AuthContext | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ load auth state 1 lần duy nhất
  useEffect(() => {
    try {
      ensureClientSeedAdmin();
    } catch (e) {}

    const u = getStoredUser();
    setUser(u);
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const u = await loginMock(email, password);
    setUser(u);
  }

  async function register(
    email: string,
    password: string,
    name?: string
  ) {
    const u = await registerMock(email, password, name);
    if (!user) setUser(u);
    return u;
  }

  async function updateProfileClient(data: { name?: string }) {
    if (!user) throw new Error("Not authenticated");
    const u = updateProfile(user.email, data);
    setUser(u);
  }

  async function changePasswordClient(
    oldPassword: string,
    newPassword: string
  ) {
    if (!user) throw new Error("Not authenticated");
    changePassword(user.email, oldPassword, newPassword);
  }

  async function listUsersClient() {
    return Promise.resolve(listUsers());
  }

  async function setUserRoleClient(email: string, role: string) {
    setUserRole(email, role);
    const u = getStoredUser();
    setUser(u);
  }

  async function deleteUserClient(email: string) {
    deleteUser(email);
    const u = getStoredUser();
    setUser(u);
  }

  async function setPasswordClient(email: string, newPassword: string) {
    setPassword(email, newPassword);
  }

  function logout() {
    logoutMock();
    setUser(null);
  }

  return (
    <ctx.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateProfile: updateProfileClient,
        changePassword: changePasswordClient,
        listUsers: listUsersClient,
        setUserRole: setUserRoleClient,
        deleteUser: deleteUserClient,
        setPassword: setPasswordClient,
        logout,
      }}
    >
      {children}
    </ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
