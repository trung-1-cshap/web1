"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // kiểm tra ngắn: nếu chưa đăng nhập thì chuyển hướng về /login
    if (!user) {
      try {
        const raw = localStorage.getItem('mock_user');
        if (!raw) {
          router.push('/login');
          return;
        }
      } catch (e) {
        router.push('/login');
        return;
      }
    }

    // Trước đây có kiểm tra phân quyền theo vai trò ở đây — đã bỏ để cho phép bất kỳ người dùng đã xác thực

    setChecking(false);
  }, [router, user]);

  if (checking) return null;

  return <>{children}</>;
}
