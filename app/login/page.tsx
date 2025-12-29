"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ✅ SỬA: Đổi 'hydrated' thành 'isLoading' cho khớp với AuthProvider mới
  const { user, isLoading, login } = useAuth();
  const router = useRouter();

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (isLoading) return;
    if (user) router.replace("/");
  }, [user, isLoading, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      router.replace("/");
    } catch (e: any) {
      setErr(e?.message || "Đăng nhập thất bại");
    }
  }

  // ✅ SỬA: Dùng isLoading để kiểm tra trạng thái tải
  // Nếu đang tải thì hiện màn hình trắng hoặc loading, 
  // Nếu đã có user thì cũng ẩn đi để chờ redirect.
  if (isLoading || user) return null;

  return (
    <div className="max-w-md mx-auto p-6 mt-10 border rounded shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Đăng nhập</h2>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="admin@gmail.com"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPwd ? "text" : "password"}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Nhập mật khẩu"
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="absolute right-3 top-8 text-slate-500 hover:text-slate-700"
          >
            {showPwd ? "Ẩn" : "Hiện"}
          </button>
        </div>

        {err && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{err}</div>}

        <button className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2 rounded transition-colors mt-2">
          Đăng nhập
        </button>

        <div className="text-center mt-4 text-sm">
          <span className="text-gray-600">Chưa có tài khoản? </span>
          <Link href="/register" className="text-amber-600 font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </form>
    </div>
  );
}