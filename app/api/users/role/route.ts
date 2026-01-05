import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json();
    const { email, role, requesterEmail } = body as any;

    if (!email || !role) {
      return NextResponse.json({ error: 'Thiếu email hoặc role' }, { status: 400 });
    }

    if (!requesterEmail) {
      return NextResponse.json({ error: 'Thiếu thông tin requester' }, { status: 403 });
    }

    const requester = await prisma.user.findUnique({ where: { email: String(requesterEmail) } });
    if (!requester || String(requester.role).toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Chỉ admin mới có quyền thay đổi role' }, { status: 403 });
    }

    const target = await prisma.user.findUnique({ where: { email: String(email) } });
    if (!target) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    // Prevent changing role of ADMIN users by other admins? Allow role changes
    // but ensure admin cannot demote themselves accidentally
    if (String(target.email).toLowerCase() === String(requester.email).toLowerCase() && String(role).toUpperCase() !== String(target.role).toUpperCase()) {
      // Disallow admin changing their own role here
      return NextResponse.json({ error: 'Không thể thay đổi quyền cho chính bạn' }, { status: 403 });
    }

    const updated = await prisma.user.update({ where: { email: String(email) }, data: { role: String(role).toUpperCase() } });
    return NextResponse.json({ ok: true, user: { email: updated.email, role: updated.role } });
  } catch (err) {
    console.error('PUT /api/users/role error:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
