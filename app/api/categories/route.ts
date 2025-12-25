import * as prismaModule from '@/lib/prisma'
const prisma: any = (prismaModule as any).default ?? (prismaModule as any).prisma ?? prismaModule

export async function GET() {
  try {
    const cats = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } })
    return new Response(JSON.stringify(cats), { headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('GET /api/categories error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ nội bộ' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

// Tạo danh mục
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, type } = body as any
    if (!name) return new Response(JSON.stringify({ error: 'Thiếu tên danh mục' }), { status: 400, headers: { 'content-type': 'application/json' } })

    // chuẩn hóa kiểu: chấp nhận 'thu'|'chi' hoặc 'INCOME'|'EXPENSE'
    const normalized = (type === 'thu') ? 'INCOME' : (type === 'chi') ? 'EXPENSE' : (type === 'INCOME' ? 'INCOME' : 'EXPENSE')

    const created = await prisma.category.create({ data: { name: String(name), type: normalized } })
    return new Response(JSON.stringify(created), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('POST /api/categories error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ nội bộ' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

// Xóa danh mục
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body as any
    if (!id) return new Response(JSON.stringify({ error: 'Thiếu id' }), { status: 400, headers: { 'content-type': 'application/json' } })
    await prisma.category.delete({ where: { id: Number(id) } })
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('DELETE /api/categories error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ nội bộ' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
