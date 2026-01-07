"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { canExport } from "@/lib/permissions";
import { useState } from "react";

export default function NavBar() {
  const pathname = usePathname() || "/";
  // Đổi hydrated -> isLoading
  const { user, isLoading, logout } = useAuth();

  // FIX: Nếu đang loading, hiển thị khung header rỗng để không bị nhảy layout
  if (isLoading) {
    return <header className="h-36 md:h-28 lg:h-40 header-gradient" />;
  }
  
  // ... (Phần code hiển thị menu giữ nguyên như cũ) ...
  // Chỉ cần thay thế đoạn check hydrated cũ bằng đoạn check isLoading trên là được.
  
  // Code menu cũ của bạn (viết gọn lại để bạn dễ copy):
  const navItems: { label: string; href: string }[] = [
    { label: "Trang Chủ", href: "/" },
    { label: "Danh mục", href: "/admin/categories" },
    { label: "Giao dịch", href: "/admin/transactions" },
    { label: "Tài khoản", href: "/admin/accounts" },
  ];

  // Hiển thị mục Báo cáo chỉ khi user có quyền export (admin/accountant)
  if (canExport(user)) {
    navItems.push({ label: "Báo cáo", href: "/admin/reports" });
  }
  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="relative h-36 md:h-28 lg:h-40 header-gradient">
      <div className="absolute inset-0 -z-10" />
      <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between px-4 h-full">
        <Link href="/" className="flex items-center gap-2">
          <img className="w-8 h-8 object-contain rounded-sm bg-white/80 p-0.5" src="https://www.ndahome.com/_next/image?url=%2Flogo.png&w=384&q=75" alt="Logo" />
          <span className="text-sm font-semibold text-black">Quản lý thu chi</span>
        </Link>
        {user && (
          <>
            <nav className="hidden md:block flex-1">
              <ul className="flex justify-center gap-6">
                {navItems.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href} className={`px-4 py-2 rounded-md font-semibold transition ${isActive(it.href) ? "bg-white/30 text-black" : "text-black hover:text-[#48a0f7] hover:bg-white/10"}`}>{it.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        )}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <MobileMenu navItems={navItems} user={user} isActive={isActive} logout={logout} />
              <Link href="/profile" className="text-sm text-black hover:underline hidden sm:block">
                <div>Xin chào, {user.name}</div>
                <div className="text-xs text-black/70">{String(user.role ?? "user")}</div>
              </Link>
              <button onClick={logout} className="px-3 py-1 rounded-md bg-red-600 text-white text-sm">Đăng xuất</button>
            </>
          ) : (
            <Link href="/login" className="px-4 py-2 rounded-md font-bold text-black bg-linear-to-r from-amber-400 to-amber-800">Đăng Nhập</Link>
          )}
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ navItems, user, isActive, logout }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button aria-label="Mở menu" aria-expanded={open} onClick={() => setOpen(!open)} className="p-2 rounded-md bg-white/80">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"></path></svg>
      </button>

      {open && (
        <div className="absolute right-4 top-16 z-20 w-56 bg-white rounded shadow-md">
          <ul className="flex flex-col">
            {navItems.map((it: any) => (
              <li key={it.href} className="border-b last:border-b-0">
                <Link href={it.href} className={`block px-4 py-3 ${isActive(it.href) ? "bg-gray-100" : "hover:bg-gray-50"}`}>{it.label}</Link>
              </li>
            ))}
          </ul>
          <div className="p-3 border-t flex items-center justify-between">
            <Link href="/profile" className="text-sm">{user?.name}</Link>
            <button onClick={logout} className="text-sm text-red-600">Đăng xuất</button>
          </div>
        </div>
      )}
    </div>
  );
}