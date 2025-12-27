import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs"; // ép chạy Node runtime

export async function GET() {
  try {
    const prisma = getPrisma();
    const cats = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(cats);
  } catch (err) {
    console.error("GET /api/categories error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const { name, type } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
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
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const prisma = getPrisma();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await prisma.category.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/categories error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
