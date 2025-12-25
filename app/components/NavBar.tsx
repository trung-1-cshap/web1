"use client"

// CHÚ Ý: Component Header
// - Được render trong: [app/layout.tsx](app/layout.tsx#L34)
// - Thẻ <header> trong file này bắt đầu tại: app/components/NavBar.tsx#L40
// Bạn có thể chỉnh sửa markup header bên dưới để thay đổi header / thanh trên cùng.

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

// HEADER_BG: chỉnh giá trị này thành đường dẫn ảnh hoặc URL của bạn.
// Khuyến nghị: lưu ảnh vào `public/header-bg.jpg` và đặt HEADER_BG = '/header-bg.jpg'
// URL ảnh bạn cung cấp:
// https://img2.thuthuat123.com/uploads/2020/04/07/anh-bau-troi-may-dep-nhat_094801736.jpg
// Hiện đang dùng URL bên ngoài dưới đây. Nếu muốn dùng file local, hãy tải ảnh vào `public/` và đổi HEADER_BG tương ứng.
const HEADER_BG = ''

export default function NavBar() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const { user, logout } = useAuth()

  // Nút Đăng Nhập/Đăng Ký dùng gradient hộ phách -> tối dần (không có UI thay đổi cho người dùng)

  const navItems = [
    { label: 'Trang Chủ', href: '/' },
    { label: 'Danh mục', href: '/admin/categories' },
    { label: 'Giao dịch', href: '/admin/transactions' },
    { label: 'Tài khoản', href: '/admin/accounts' },
    { label: 'Báo cáo', href: '/admin/reports' },
  ]

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  function handleLogout() {
    logout()
    router.push('/')
  }

  return (
    <header className="relative h-36 md:h-28 lg:h-40 header-gradient">
        {/* Phần nền trang trí phía sau header (toàn bộ khối)
          ĐIỂM THAY ẢNH: chỉnh `HEADER_BG` ở đầu file này
        */}
      {/* Background image removed to use solid header color */}

      {/* Lớp phủ (overlay) mờ nhẹ để chữ dễ đọc trên nền ảnh */}
      <div className="absolute inset-0 -z-10" />

      <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between px-4 h-full">
        {/* Bên trái: Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img className="w-8 h-8 object-contain rounded-sm bg-white/80 p-0.5" src="https://www.ndahome.com/_next/image?url=%2Flogo.png&w=384&q=75" alt="Logo" />
            <div className="text-sm font-semibold text-white">Quản lý thu chi</div>
          </Link>
        </div>      

        {/* Ở giữa: menu điều hướng (dùng hiệu ứng chuyển mượt) */}
        <div className={`flex-1 transition-all duration-300 ease-out ${user ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
          <nav>
            <ul className="flex justify-center gap-6 list-none m-0 p-0">
              {navItems.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={`nav-link inline-block px-4 py-2 rounded-md font-semibold transform transition duration-200 ease-out ${isActive(it.href) ? 'active bg-white/30 text-white' : 'text-white hover:text-[#48a0f7] hover:bg-white/10 hover:scale-105 hover:shadow-md'}`}
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Phía phải: nút/ hành động */}
        <div className="flex items-center gap-4">
          <div className={`transition-all duration-300 ease-out ${user ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
            <div className="flex items-center gap-3">
              <Link href="/profile" className="text-sm font-medium text-white text-right hover:underline transition-transform duration-150 hover:scale-105">
                <div>Xin chào, {user?.name}</div>
                <div className="text-xs text-white/70">{(user?.role ?? 'user').toString()}</div>
              </Link>
              <button onClick={handleLogout} className="ml-3 px-3 py-1 rounded-md bg-red-600/90 text-white text-sm transform transition duration-150 hover:scale-105 hover:shadow-sm">Đăng xuất</button>
            </div>
          </div>

          <div className={`transition-all duration-300 ease-out ${!user ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
            <div className="flex items-center">
              <Link href="/login" className="px-4 py-2 rounded-md font-bold text-white bg-gradient-to-r from-amber-400 to-amber-800 shadow transform transition duration-150 hover:scale-105 hover:shadow-lg">Đăng Nhập</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
