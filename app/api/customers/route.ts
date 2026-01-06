import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

/* ================= GET ================= */
export async function GET(req: Request) {
  try {
    const prisma = getPrisma();
    const url = new URL(req.url);
    const deletedParam = url.searchParams.get("deleted");
    console.debug('[api/customers] GET', { url: req.url, deletedParam });
    const whereClause: any = {};
    if (deletedParam === "true") whereClause.deleted = true;
    else whereClause.deleted = false;

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(customers);
  } catch (err) {
    console.error("GET /api/customers error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

/* ================= POST ================= */
export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json();

    const requesterEmail = String(body?.email ?? "").trim();
    if (!requesterEmail) {
      return NextResponse.json({ error: "Missing requester email" }, { status: 401 });
    }

    const requester = await prisma.user.findUnique({ where: { email: requesterEmail } });
    if (!requester) {
      return NextResponse.json({ error: "Requester not found" }, { status: 403 });
    }

    const requesterRole = String(requester.role ?? "").toUpperCase();
    if (requesterRole === "MANAGER") {
      return NextResponse.json({ error: "Không có quyền tạo khách hàng" }, { status: 403 });
    }

    if (!body.name) {
      return NextResponse.json(
        { error: "Thiếu tên khách hàng" },
        { status: 400 }
      );
    }

    const created = await prisma.customer.create({
      data: {
        name: String(body.name),
        phone: body.phone ? String(body.phone) : null,

        depositDate: body.depositDate
          ? new Date(body.depositDate)
          : null,

        contractDate: body.contractDate
          ? new Date(body.contractDate)
          : null,

        // ✅ SỐ THÁNG HỢP ĐỒNG
        contractValidityMonths:
          body.contractValidityMonths != null
            ? Number(body.contractValidityMonths)
            : null,

        depositAmount:
          body.depositAmount != null
            ? Number(body.depositAmount)
            : null,

        contractAmount:
          body.contractAmount != null
            ? Number(body.contractAmount)
            : null,

        commission:
          body.commission != null
            ? Number(body.commission)
            : null,

        received: Boolean(body.received),

        performedBy: body.performedBy
          ? String(body.performedBy)
          : null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/customers error:", err);
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

    // Authorization: require requesterEmail and block basic 'USER' role from editing customers
    const requesterEmail = String(body?.requesterEmail ?? '').trim();
    if (!requesterEmail) {
      return NextResponse.json({ error: 'Missing requesterEmail' }, { status: 401 });
    }
    const requester = await prisma.user.findUnique({ where: { email: requesterEmail } });
    if (!requester) {
      return NextResponse.json({ error: 'Requester not found' }, { status: 403 });
    }
    const role = String(requester.role ?? '').toUpperCase();
    if (role === 'USER') {
      return NextResponse.json({ error: 'Không có quyền chỉnh sửa khách hàng' }, { status: 403 });
    }

    const updated = await prisma.customer.update({
      where: { id: Number(id) },
      data: {
        name:
          data.name !== undefined
            ? String(data.name)
            : undefined,

        phone:
          data.phone !== undefined
            ? data.phone
              ? String(data.phone)
              : null
            : undefined,

        depositDate:
          data.depositDate !== undefined
            ? data.depositDate
              ? new Date(data.depositDate)
              : null
            : undefined,

        contractDate:
          data.contractDate !== undefined
            ? data.contractDate
              ? new Date(data.contractDate)
              : null
            : undefined,

        // ✅ SỐ THÁNG HỢP ĐỒNG
        contractValidityMonths:
          data.contractValidityMonths !== undefined
            ? data.contractValidityMonths != null
              ? Number(data.contractValidityMonths)
              : null
            : undefined,

        depositAmount:
          data.depositAmount !== undefined
            ? data.depositAmount != null
              ? Number(data.depositAmount)
              : null
            : undefined,

        contractAmount:
          data.contractAmount !== undefined
            ? data.contractAmount != null
              ? Number(data.contractAmount)
              : null
            : undefined,

        commission:
          data.commission !== undefined
            ? data.commission != null
              ? Number(data.commission)
              : null
            : undefined,

        received:
          data.received !== undefined
            ? Boolean(data.received)
            : undefined,

        performedBy:
          data.performedBy !== undefined
            ? data.performedBy
              ? String(data.performedBy)
              : null
            : undefined,
        // Handle soft-delete toggle if provided
        ...(data.deleted !== undefined ? { deleted: Boolean(data.deleted), deletedAt: data.deleted ? new Date() : null } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/customers error:", err);
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
    const id = body?.id;
    const permanent = Boolean(body?.permanent);

    if (!id) {
      return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
    }

    // Authorization: require requesterEmail and block basic 'USER' role from deleting customers
    const requesterEmail = String(body?.requesterEmail ?? '').trim();
    if (!requesterEmail) {
      return NextResponse.json({ error: 'Missing requesterEmail' }, { status: 401 });
    }
    const requester = await prisma.user.findUnique({ where: { email: requesterEmail } });
    if (!requester) {
      return NextResponse.json({ error: 'Requester not found' }, { status: 403 });
    }
    const role = String(requester.role ?? '').toUpperCase();
    if (role === 'USER') {
      return NextResponse.json({ error: 'Không có quyền xóa khách hàng' }, { status: 403 });
    }

    if (permanent) {
      await prisma.customer.delete({ where: { id: Number(id) } });
      return NextResponse.json({ ok: true, deleted: true });
    }

    // Soft-delete: mark as deleted
    await prisma.customer.update({
      where: { id: Number(id) },
      data: { deleted: true, deletedAt: new Date() },
    });

    return NextResponse.json({ ok: true, deleted: false });
  } catch (err) {
    console.error("DELETE /api/customers error:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}
