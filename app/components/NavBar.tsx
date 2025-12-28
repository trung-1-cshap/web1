"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

const HEADER_BG = "";

export default function NavBar() {
  const pathname = usePathname() || "/";
  const { user, hydrated, logout } = useAuth();

  // ⛔ RẤT QUAN TRỌNG: chờ hydrate xong
  if (!hydrated) return null;

  const navItems = [
    { label: "Trang Chủ", href: "/" },
    { label: "Danh mục", href: "/admin/categories" },
    { label: "Giao dịch", href: "/admin/transactions" },
    { label: "Tài khoản", href: "/admin/accounts" },
    { label: "Báo cáo", href: "/admin/reports" },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="relative h-36 md:h-28 lg:h-40 header-gradient">
      <div className="absolute inset-0 -z-10" />

      <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between px-4 h-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            className="w-8 h-8 object-contain rounded-sm bg-white/80 p-0.5"
            src="https://www.ndahome.com/_next/image?url=%2Flogo.png&w=384&q=75"
            alt="Logo"
          />
          <span className="text-sm font-semibold text-white">
            Quản lý thu chi
          </span>
        </Link>

        {/* Menu */}
        {user && (
          <nav className="flex-1">
            <ul className="flex justify-center gap-6">
              {navItems.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={`px-4 py-2 rounded-md font-semibold transition ${
                      isActive(it.href)
                        ? "bg-white/30 text-white"
                        : "text-white hover:text-[#48a0f7] hover:bg-white/10"
                    }`}
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/profile"
                className="text-sm text-white hover:underline"
              >
                <div>Xin chào, {user.name}</div>
                <div className="text-xs text-white/70">
                  {String(user.role ?? "user")}
                </div>
              </Link>

              <button
                onClick={logout}
                className="px-3 py-1 rounded-md bg-red-600 text-white text-sm"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-md font-bold text-white bg-gradient-to-r from-amber-400 to-amber-800"
            >
              Đăng Nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
