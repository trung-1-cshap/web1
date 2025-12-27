import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

/* ================= GET ================= */
export async function GET() {
  try {
    const prisma = getPrisma();
    const txs = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true, account: true, user: true },
    });
    return NextResponse.json(txs);
  } catch (err) {
    console.error("GET /api/transactions error:", err);
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

    const updateData: any = {};
    if (data.amount != null) updateData.amount = Number(data.amount);
    if (data.type != null) {
      updateData.type =
        data.type === "thu" || data.type === "INCOME"
          ? "INCOME"
          : data.type === "chi" || data.type === "EXPENSE"
          ? "EXPENSE"
          : undefined;
    }
    if (data.description !== undefined)
      updateData.description =
        data.description === "" ? null : String(data.description);
    if (data.date) updateData.date = new Date(data.date);
    if (data.categoryId != null)
      updateData.categoryId = Number(data.categoryId);
    if (data.accountId != null)
      updateData.accountId = Number(data.accountId);
    if (data.userId != null) updateData.userId = String(data.userId);

    const updated = await prisma.transaction.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/transactions error:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}

/* ================= DELETE ================= */
export async function DELETE(req: Request) {
  try {
    const prisma = getPrisma();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
    }

    await prisma.transaction.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/transactions error:", err);
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

    const {
      amount: rawAmount,
      type: rawType,
      description,
      categoryId,
      accountId,
      userId,
      date,
    } = body;

    const amount = Number(rawAmount ?? 0);
    const type =
      rawType === "thu" || rawType === "INCOME" ? "INCOME" : "EXPENSE";

    const tx = await prisma.transaction.create({
      data: {
        amount,
        type,
        description: description || null,
        date: date ? new Date(date) : undefined,
        categoryId: Number(categoryId),
        accountId: Number(accountId),
        userId: String(userId),
      },
    });

    return NextResponse.json(tx, { status: 201 });
  } catch (err) {
    console.error("POST /api/transactions error:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}
