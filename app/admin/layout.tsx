"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider"; // Sửa đường dẫn nếu cần

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Nếu đang tải thì chưa làm gì cả (đợi AuthProvider đọc LocalStorage)
    if (isLoading) return;

    // Tải xong mà không có user => Đá về login
    if (!user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // Trong lúc chờ, hiển thị màn hình loading hoặc null
  if (isLoading) {
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  }

  // Nếu không có user (và đang đợi redirect), không render nội dung admin
  if (!user) return null;

  return <>{children}</>;
}