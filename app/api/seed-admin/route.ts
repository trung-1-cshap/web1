import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();

    const isProd = process.env.NODE_ENV === "production";
    // In production require a secret key (query param `key` or body.key)
    if (isProd) {
      const url = new URL(req.url);
      const provided = url.searchParams.get("key") || (await req.json()).key;
      const secret = process.env.SEED_KEY;
      if (!secret || provided !== secret) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const admins = [
      { email: "NguyenDuyAn@gmail.com", password: "admin@123", name: "Nguyen Duy An" },
      { email: "Trung@gmail.com", password: "admin@123", name: "Trung" },
      { email: "Vinh@gmail.com", password: "admin@123", name: "Vinh" },
    ];

    const created: Array<{ email: string; id?: string }> = [];
    const existing: string[] = [];

    for (const a of admins) {
      const found = await prisma.user.findUnique({ where: { email: a.email } });
      if (found) {
        existing.push(a.email);
        continue;
      }
      const user = await prisma.user.create({
        data: {
          email: a.email,
          password: a.password,
          name: a.name,
          role: "ADMIN",
        },
      });
      created.push({ email: user.email, id: user.id });
    }

    return NextResponse.json({ created, existing });
  } catch (err) {
    console.error("Seed admin error:", err);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
