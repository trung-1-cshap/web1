import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

/* ================= GET ================= */
export async function GET() {
  try {
    const prisma = getPrisma();
    const txs = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        account: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
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

    // ✅ validate bắt buộc
    if (
      rawAmount == null ||
      !categoryId ||
      !accountId ||
      !userId
    ) {
      return NextResponse.json(
        { error: "Thiếu dữ liệu bắt buộc" },
        { status: 400 }
      );
    }

    const amount = Number(rawAmount);
    if (Number.isNaN(amount)) {
      return NextResponse.json(
        { error: "Số tiền không hợp lệ" },
        { status: 400 }
      );
    }

    const type =
      rawType === "thu" || rawType === "INCOME"
        ? "INCOME"
        : "EXPENSE";

    const created = await prisma.transaction.create({
      data: {
        amount,
        type,
        description: description ? String(description) : null,
        date: date ? new Date(date) : new Date(),
        categoryId: Number(categoryId),
        accountId: Number(accountId),
        userId: String(userId),

        // approval mặc định
        approved: false,
        approvedAt: null,
        approvedBy: null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/transactions error:", err);
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
      return NextResponse.json(
        { error: "Thiếu id" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (data.amount !== undefined) {
      const amt = Number(data.amount);
      if (Number.isNaN(amt)) {
        return NextResponse.json(
          { error: "Số tiền không hợp lệ" },
          { status: 400 }
        );
      }
      updateData.amount = amt;
    }

    if (data.type !== undefined) {
      updateData.type =
        data.type === "thu" || data.type === "INCOME"
          ? "INCOME"
          : "EXPENSE";
    }

    if (data.description !== undefined) {
      updateData.description =
        data.description === "" ? null : String(data.description);
    }

    if (data.date !== undefined) {
      updateData.date = data.date ? new Date(data.date) : null;
    }

    if (data.categoryId !== undefined) {
      updateData.categoryId = Number(data.categoryId);
    }

    if (data.accountId !== undefined) {
      updateData.accountId = Number(data.accountId);
    }

    if (data.userId !== undefined) {
      updateData.userId = String(data.userId);
    }

    // ✅ xử lý duyệt / đã thu
    if (data.approved !== undefined) {
      updateData.approved = Boolean(data.approved);
      updateData.approvedAt = data.approved ? new Date() : null;
      updateData.approvedBy = data.approvedBy
        ? String(data.approvedBy)
        : null;
    }

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
      return NextResponse.json(
        { error: "Thiếu id" },
        { status: 400 }
      );
    }

    await prisma.transaction.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/transactions error:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}
