import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    // 1. Tìm user trong Database thật
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    // 2. Kiểm tra mật khẩu (đơn giản, so sánh chuỗi)
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Sai email hoặc mật khẩu" }, { status: 401 });
    }

    // 3. Trả về thông tin User (không trả mật khẩu về client)
    const { password: _, ...userWithoutPass } = user;
    return NextResponse.json(userWithoutPass);

  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}