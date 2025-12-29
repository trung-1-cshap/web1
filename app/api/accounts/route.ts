import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

/* ================= GET ================= */
export async function GET() {
  try {
    const prisma = getPrisma();
    // Lấy danh sách tài khoản, sắp xếp theo ID
    const accounts = await prisma.account.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(accounts);
  } catch (err) {
    console.error("GET /api/accounts error:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}

/* ================= POST ================= */
export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "Thiếu tên tài khoản" },
        { status: 400 }
      );
    }

    const created = await prisma.account.create({
      data: {
        name: String(body.name),
        initialBalance: body.initialBalance ? Number(body.initialBalance) : 0,
        currentBalance: body.currentBalance ? Number(body.currentBalance) : 0,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/accounts error:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}

/* ================= PUT ================= */
export async function PUT(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
        return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
    }

    const updated = await prisma.account.update({
        where: { id: Number(id) },
        data: {
            name: data.name,
            currentBalance: data.currentBalance !== undefined ? Number(data.currentBalance) : undefined,
            // Thường không ai sửa initialBalance, nhưng nếu cần thì thêm vào đây
        }
    });

    return NextResponse.json(updated);
  } catch(err) {
    console.error("PUT /api/accounts error:", err);
    return NextResponse.json({ error: "Lỗi update tài khoản"}, { status: 500 });
  }
}