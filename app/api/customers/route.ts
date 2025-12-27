import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

/* ================= GET ================= */
export async function GET() {
  try {
    const prisma = getPrisma();
    const customers = await prisma.customer.findMany({
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
        depositDate: body.depositDate ? new Date(body.depositDate) : null,
        contractDate: body.contractDate ? new Date(body.contractDate) : null,
        depositAmount:
          body.depositAmount != null ? Number(body.depositAmount) : null,
        contractAmount:
          body.contractAmount != null ? Number(body.contractAmount) : null,
        commission:
          body.commission != null ? Number(body.commission) : null,
        received: Boolean(body.received),
        performedBy: body.performedBy ? String(body.performedBy) : null,
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

    const updated = await prisma.customer.update({
      where: { id: Number(id) },
      data: {
        name: data.name !== undefined ? String(data.name) : undefined,
        phone: data.phone !== undefined ? String(data.phone) : undefined,
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
          data.received !== undefined ? Boolean(data.received) : undefined,
        performedBy:
          data.performedBy !== undefined
            ? String(data.performedBy)
            : undefined,
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
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
    }

    await prisma.customer.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/customers error:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}
