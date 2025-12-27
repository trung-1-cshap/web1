import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const prisma = getPrisma(); // ✅ BẮT BUỘC

    const body = await req.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Thiếu email hoặc mật khẩu" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        role: "ACCOUNTANT",
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}
