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
    if (!hydrated) return;        // ⛔ chờ client hydrate xong
    if (!user) {
      router.replace("/login");  // ❌ chưa login → đá về login
    }
  }, [user, hydrated, router]);

  // ⛔ chưa hydrate hoặc chưa login thì không render gì
  if (!hydrated || !user) return null;

  return <>{children}</>;
}
