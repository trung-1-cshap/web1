"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;          // ⛔ chờ hydrate xong
    if (!user) {
      router.replace("/login");     // ❌ chưa login → đá
    }
  }, [user, hydrated, router]);

  // ⛔ tránh render nhấp nháy
  if (!hydrated || !user) return null;

  return <>{children}</>;
}
