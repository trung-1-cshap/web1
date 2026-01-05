import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const prisma = getPrisma();
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true } });
    return NextResponse.json(users);
  } catch (err) {
    console.error("GET /api/users error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json();

    if (!body.email || !body.password) {
      return NextResponse.json({ error: "Thiếu email hoặc mật khẩu" }, { status: 400 });
    }

    // If no users exist yet, allow creating the first user and make them ADMIN
    const usersCount = await prisma.user.count();
    if (usersCount === 0) {
      const user = await prisma.user.create({ data: { email: body.email, password: body.password, name: body.name ?? null, role: 'ADMIN' } });
      return NextResponse.json(user, { status: 201 });
    }

    // Otherwise, require requesterEmail belonging to an ADMIN
    const requesterEmail = body.requesterEmail ?? null;
    if (!requesterEmail) {
      return NextResponse.json({ error: "Chỉ admin mới có quyền tạo tài khoản" }, { status: 403 });
    }

    const requester = await prisma.user.findUnique({ where: { email: String(requesterEmail) } });
    if (!requester || requester.role !== 'ADMIN') {
      return NextResponse.json({ error: "Chỉ admin mới có quyền tạo tài khoản" }, { status: 403 });
    }

    // Create new user with default role ACCOUNTANT
    try {
      const created = await prisma.user.create({ data: { email: body.email, password: body.password, name: body.name ?? null, role: 'ACCOUNTANT' } });
      return NextResponse.json(created, { status: 201 });
    } catch (err: any) {
      // handle unique constraint
      console.error('create user failed', err);
      return NextResponse.json({ error: 'Không thể tạo người dùng (có thể email đã tồn tại)' }, { status: 409 });
    }
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}

/* ================= DELETE ================= */
export async function DELETE(req: Request) {
  try {
    const prisma = getPrisma();
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Thiếu email' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { email: String(email) } });
    if (!target) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    // Do not allow deleting ADMIN accounts via this endpoint
    if (String(target.role).toUpperCase() === 'ADMIN') {
      return NextResponse.json({ error: 'Không được xóa tài khoản ADMIN' }, { status: 403 });
    }

    await prisma.user.delete({ where: { email: String(email) } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/users error:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
