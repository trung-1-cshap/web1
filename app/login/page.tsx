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

  const { user, login } = useAuth();
  const router = useRouter();

  // ✅ nếu đã login → đá khỏi trang login
  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      router.replace("/");
    } catch (e: any) {
      setErr(e?.message || "Đăng nhập thất bại");
    }
  }

  // ✅ đã login thì không render form
  if (user) return null;

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Đăng nhập</h2>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-3 py-2"
          placeholder="Email"
        />

        <div className="relative">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPwd ? "text" : "password"}
            className="border rounded px-3 py-2 w-full"
            placeholder="Mật khẩu"
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="absolute right-2 top-2 text-slate-600"
          >
            {showPwd ? "🙈" : "👁️"}
          </button>
        </div>

        {err && <div className="text-red-600">{err}</div>}

        <button className="bg-slate-800 text-white px-4 py-2 rounded">
          Đăng nhập
        </button>

        <div className="text-center mt-2">
          <Link href="/register" className="text-amber-600 font-semibold">
            Chưa có tài khoản? Đăng ký
          </Link>
        </div>
      </form>
    </div>
  );
}
