import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { AuthProvider } from "./components/AuthProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quản lí thu chi công ty NDA HOME",
  description:
    "Ứng dụng quản lí thu chi đơn giản, hiệu quả dành cho doanh nghiệp nhỏ và cá nhân.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ overscrollBehaviorX: "contain", overscrollBehaviorY: "contain" }}
      >
        <AuthProvider>
          <NavBar />
          {children}
          <Footer />

          {/* 👇 CHỈ THÊM DÒNG NÀY */}
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
