import { NextResponse } from "next/server";

/**
 * Ép route này là dynamic
 * để Next.js KHÔNG chạy khi build
 */
export const dynamic = "force-dynamic";

/**
 * Lazy-load Prisma
 * (chỉ khởi tạo khi request thực sự chạy)
 */
async function getPrisma() {
  const mod = await import("@/lib/prisma");
  return (mod as any).default ?? (mod as any).prisma ?? mod;
}

// GET /api/categories
export async function GET() {
  try {
    const prisma = await getPrisma();
    const cats = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(cats);
  } catch (err) {
    console.error("GET /api/categories error:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}

// POST /api/categories
export async function POST(req: Request) {
  try {
    const prisma = await getPrisma();
    const body = await req.json();
    const { name, type } = body as any;

    if (!name) {
      return NextResponse.json(
        { error: "Thiếu tên danh mục" },
        { status: 400 }
      );
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
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories
export async function DELETE(req: Request) {
  try {
    const prisma = await getPrisma();
    const body = await req.json();
    const { id } = body as any;

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu id" },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/categories error:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}
