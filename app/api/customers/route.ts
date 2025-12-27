import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

// ================= GET =================
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

// ================= POST =================
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

        depositDate: body.depositDate
          ? new Date(body.depositDate)
          : null,

        contractDate: body.contractDate
          ? new Date(body.contractDate)
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

// ================= PUT =================
export async function PUT(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
    }

    const updated = await prisma.customer.update({
      where: { id: Number(body.id) },
      data: {
        name: body.name ? String(body.name) : undefined,
        phone: body.phone ? String(body.phone) : undefined,

        depositDate:
          body.depositDate !== undefined
            ? body.depositDate
              ? new Date(body.depositDate)
              : null
            : undefined,

        contractDate:
          body.contractDate !== undefined
            ? body.contractDate
              ? new Date(body.contractDate)
              : null
            : undefined,

        depositAmount:
          body.depositAmount !== undefined
            ? body.depositAmount != null
              ? Number(body.depositAmount)
              : null
            : undefined,

        contractAmount:
          body.contractAmount !== undefined
            ? body.contractAmount != null
              ? Number(body.contractAmount)
              : null
            : undefined,

        commission:
          body.commission !== undefined
            ? body.commission != null
              ? Number(body.commission)
              : null
            : undefined,

        received:
          body.received !== undefined
            ? Boolean(body.received)
            : undefined,

        performedBy:
          body.performedBy !== undefined
            ? body.performedBy
              ? String(body.performedBy)
              : null
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

// ================= DELETE =================
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
