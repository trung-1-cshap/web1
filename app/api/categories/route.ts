import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const prisma = getPrisma();
    const categories = await prisma.category.findMany({
      orderBy: { id: "desc" }, // 🔴 đổi từ createdAt -> id
    });
    return NextResponse.json(categories);
  } catch (err) {
    console.error("GET /api/categories error:", err);
    return NextResponse.json(
      { error: String(err) }, // 🔴 trả lỗi thật
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json();
    const { name, type, email: requesterEmail } = body;

    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    // Require requesterEmail to authorize who is creating
    const email = String(requesterEmail ?? '').trim();
    if (!email) {
      return NextResponse.json({ error: 'Missing requesterEmail' }, { status: 401 });
    }
    const requester = await prisma.user.findUnique({ where: { email } });
    if (!requester) {
      return NextResponse.json({ error: 'Requester not found' }, { status: 403 });
    }
    const role = String(requester.role ?? '').toUpperCase();

    // Block MANAGER and USER from creating categories
    if (role === 'MANAGER' || role === 'USER') {
      return NextResponse.json({ error: 'Không có quyền tạo danh mục' }, { status: 403 });
    }

    const normalized =
      type === "thu"
        ? "INCOME"
        : type === "chi"
        ? "EXPENSE"
        : type === "INCOME"
        ? "INCOME"
        : "EXPENSE";

    const created = await prisma.category.create({
      data: { name: String(name), type: normalized },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/categories error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const prisma = getPrisma();
    const { id, requesterEmail } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const email = String(requesterEmail ?? '').trim();
    if (!email) {
      return NextResponse.json({ error: 'Missing requesterEmail' }, { status: 401 });
    }
    const requester = await prisma.user.findUnique({ where: { email } });
    if (!requester) {
      return NextResponse.json({ error: 'Requester not found' }, { status: 403 });
    }
    const role = String(requester.role ?? '').toUpperCase();
    // Block basic 'USER' and 'MANAGER' roles from deleting categories
    if (role === 'USER' || role === 'MANAGER') {
      return NextResponse.json({ error: 'Không có quyền xóa' }, { status: 403 });
    }

    await prisma.category.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/categories error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
