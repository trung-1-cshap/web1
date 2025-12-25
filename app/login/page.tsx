"use client"

import { useState } from 'react';
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const auth = useAuth();
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await auth.login(email, password);
      router.push('/');
    } catch (e: any) {
      setErr(e?.message || 'Đăng nhập thất bại');
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4"><></>Đăng nhập</h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="border rounded px-3 py-2" placeholder="Email" />
        <div className="relative">
          <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPwd ? 'text' : 'password'} className="border rounded px-3 py-2 w-full" placeholder="Mật khẩu" />
          <button type="button" onClick={() => setShowPwd(s => !s)} aria-label={showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className="absolute right-2 top-2 text-slate-600">
            {showPwd ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.44-4.042" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.6 6.6A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-1.06 2.22" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {err && <div className="text-red-600">{err}</div>}
        <button className="bg-slate-800 text-white px-4 py-2 rounded">Đăng nhập</button>

        <div className="text-center mt-2">
          <Link href="/register" className="text-amber-600 font-semibold">Chưa có tài khoản? Đăng ký</Link>
        </div>
      </form>
    </div>
  );
}
