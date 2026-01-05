import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

/* ================= GET ================= */
export async function GET(req: Request) {
  try {
    const prisma = getPrisma();
    const url = new URL(req.url);
    const deletedParam = url.searchParams.get("deleted");
    console.debug('[api/transactions] GET', { url: req.url, deletedParam });
    const whereClause: any = {};
    if (deletedParam === "true") whereClause.deleted = true;
    else whereClause.deleted = false;
    console.debug('[api/transactions] whereClause', whereClause);

    const txs = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        account: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(txs);
  } catch (err) {
    console.error("GET /api/transactions error:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ", details: String(err) },
      { status: 500 }
    );
  }
}

/* ================= POST ================= */
export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json();
    console.debug('[api/transactions] POST body', body);

    const {
      amount: rawAmount,
      type: rawType,
      description,
      categoryId,
      accountId,
      date,
      email, // 👈 QUAN TRỌNG: Nhận email từ frontend
    } = body;

    // 1. Validate dữ liệu bắt buộc
    if (rawAmount == null || !categoryId || !accountId || !email) {
      return NextResponse.json(
        { error: "Thiếu dữ liệu (Tiền, Danh mục, Tài khoản hoặc Email)" },
        { status: 400 }
      );
    }

    // 2. Validate số tiền
    const amount = Number(rawAmount);
    if (Number.isNaN(amount)) {
      return NextResponse.json(
        { error: "Số tiền không hợp lệ" },
        { status: 400 }
      );
    }

    // 3. Chuẩn hóa loại giao dịch
    const type =
      rawType === "thu" || rawType === "INCOME"
        ? "INCOME"
        : "EXPENSE";

    // 4. Tìm User ID dựa trên Email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại. Vui lòng đăng nhập lại." },
        { status: 404 }
      );
    }

    // Authorization: không cho phép role MANAGER tạo giao dịch
    const role = String(user.role ?? "").toUpperCase();
    if (role === "MANAGER") {
      return NextResponse.json({ error: "Không có quyền tạo giao dịch" }, { status: 403 });
    }

    // 5. Tạo giao dịch
    const created = await prisma.transaction.create({
      data: {
        amount,
        type,
        description: description ? String(description) : null,
        date: date ? new Date(date) : new Date(),
        categoryId: Number(categoryId),
        accountId: Number(accountId),
        userId: user.id, // ✅ Dùng ID thật lấy từ Database

        // Mặc định chưa duyệt
        approved: false,
        approvedAt: null,
        approvedBy: null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/transactions error:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ: " + String(err) },
      { status: 500 }
    );
  }
}

/* ================= PUT ================= */
export async function PUT(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json();
    console.debug('[api/transactions] PUT body', body);
    const { id, requesterEmail, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
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

    // Soft-delete / restore support
    if (data.deleted !== undefined) {
      // Authorization: only allow soft-delete/restore for non-'user' roles
      const email = String(requesterEmail ?? '').trim();
      if (!email) {
        return NextResponse.json({ error: 'Missing requesterEmail' }, { status: 401 });
      }
      const requester = await prisma.user.findUnique({ where: { email } });
      if (!requester) {
        return NextResponse.json({ error: 'Requester not found' }, { status: 403 });
      }
      const role = String(requester.role ?? '').toUpperCase();
      if (role === 'USER') {
        return NextResponse.json({ error: 'Không có quyền xóa' }, { status: 403 });
      }

      updateData.deleted = Boolean(data.deleted);
      updateData.deletedAt = data.deleted ? new Date() : null;
    }

    // ❌ Không cho phép update userId trực tiếp qua API này để tránh lỗi
    // Nếu muốn đổi người tạo, logic sẽ phức tạp hơn.

    // ✅ Xử lý duyệt
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
    const body = await req.json();
    console.debug('[api/transactions] DELETE body', body);
    const { id, permanent, requesterEmail } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
    }

    // Authorization: only allow deletes for non-'user' roles
    const email = String(requesterEmail ?? '').trim();
    if (!email) {
      return NextResponse.json({ error: 'Missing requesterEmail' }, { status: 401 });
    }
    const requester = await prisma.user.findUnique({ where: { email } });
    if (!requester) {
      return NextResponse.json({ error: 'Requester not found' }, { status: 403 });
    }
    const role = String(requester.role ?? '').toUpperCase();
    if (role === 'USER') {
      return NextResponse.json({ error: 'Không có quyền xóa' }, { status: 403 });
    }

    if (permanent) {
      await prisma.transaction.delete({ where: { id: Number(id) } });
      return NextResponse.json({ ok: true, deleted: true });
    }

    await prisma.transaction.update({
      where: { id: Number(id) },
      data: { deleted: true, deletedAt: new Date() },
    });

    return NextResponse.json({ ok: true, softDeleted: true });
  } catch (err) {
    console.error("DELETE /api/transactions error:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}