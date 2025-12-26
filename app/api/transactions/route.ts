import * as prismaModule from '@/lib/prisma'
const prisma: any = (prismaModule as any).default ?? (prismaModule as any).prisma ?? prismaModule

export async function GET() {
  try {
    const txs = await prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, include: { category: true, account: true, user: true } })
    return new Response(JSON.stringify(txs), { headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('GET /api/transactions error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ nội bộ' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return new Response(JSON.stringify({ error: 'Thiếu id' }), { status: 400, headers: { 'content-type': 'application/json' } })
    console.debug('PUT /api/transactions body:', body)
    // Làm sạch dữ liệu vào: chỉ cho phép các trường có thể cập nhật và chuẩn hóa kiểu
    const updateData: any = {}
    if (data.amount != null) updateData.amount = Number(data.amount)
    if (data.type != null) {
      updateData.type = (data.type === 'thu' || data.type === 'INCOME') ? 'INCOME' : (data.type === 'chi' || data.type === 'EXPENSE') ? 'EXPENSE' : undefined
      if (!updateData.type) delete updateData.type
    }
    if (data.description !== undefined) updateData.description = data.description === '' ? null : String(data.description)
    if (data.date) updateData.date = new Date(data.date)
    if (data.categoryId != null) updateData.categoryId = Number(data.categoryId)
    if (data.accountId != null) updateData.accountId = Number(data.accountId)
    if (data.userId != null) updateData.userId = String(data.userId)
    // Note: approval feature removed from UI/server — ignore any approval fields
    // (do not forward `approved`, `approvedBy`, `approvedAt` to Prisma)

    if (Object.keys(updateData).length === 0) {
      return new Response(JSON.stringify({ error: 'Không có trường hợp hợp lệ để cập nhật' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }

    try {
      const updated = await prisma.transaction.update({ where: { id: Number(id) }, data: updateData })
      console.debug('PUT /api/transactions updated:', updated)
      return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } })
    } catch (innerErr: any) {
      console.error('PUT /api/transactions prisma update error:', innerErr)
      const msg = String(innerErr?.message || innerErr || 'Lỗi khi cập nhật giao dịch')
      return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'content-type': 'application/json' } })
    }
  } catch (err) {
    console.error('PUT /api/transactions error:', err)
    return new Response(JSON.stringify({ error: String((err as any)?.message || 'Lỗi máy chủ nội bộ') }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const idRaw = body?.id
    if (!idRaw) return new Response(JSON.stringify({ error: 'Thiếu id' }), { status: 400, headers: { 'content-type': 'application/json' } })
    const idNum = Number(idRaw)
    if (Number.isNaN(idNum)) return new Response(JSON.stringify({ error: 'Id không hợp lệ' }), { status: 400, headers: { 'content-type': 'application/json' } })
    console.debug('DELETE /api/transactions id:', idNum)
    try {
      await prisma.transaction.delete({ where: { id: idNum } })
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
    } catch (err: any) {
      console.error('DELETE /api/transactions delete error for id:', idNum, err)
      // If record not found, return 404 so client can handle gracefully
      const msg = String(err?.message || '')
      if (msg.includes('Record to delete does not exist') || msg.includes('No existe') || msg.includes('not found')) {
        return new Response(JSON.stringify({ error: 'Giao dịch không tìm thấy' }), { status: 404, headers: { 'content-type': 'application/json' } })
      }
      return new Response(JSON.stringify({ error: 'Lỗi khi xóa giao dịch' }), { status: 500, headers: { 'content-type': 'application/json' } })
    }
  } catch (err) {
    console.error('DELETE /api/transactions error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ nội bộ' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.debug('POST /api/transactions body:', body)

    // Chấp nhận nhiều dạng payload từ UI/mocks
    const {
      amount: rawAmount,
      type: rawType,
      description,
      categoryId,
      categoryName,
      accountId,
      accountName,
      userEmail,
      performedBy,
      date
    } = body as any

    const amount = Number(rawAmount ?? 0)
    // chuẩn hóa kiểu: chấp nhận 'thu'|'chi' hoặc 'INCOME'|'EXPENSE'
    const type = (rawType === 'thu' || rawType === 'INCOME') ? 'INCOME' : (rawType === 'chi' || rawType === 'EXPENSE') ? 'EXPENSE' : 'EXPENSE'

    // tìm hoặc tạo user: ưu tiên email, nếu không có dùng performedBy (tên)
    let user = null
    if (userEmail) {
      user = await prisma.user.findUnique({ where: { email: userEmail } })
      if (!user) user = await prisma.user.create({ data: { email: String(userEmail), password: 'changeme', name: performedBy || null } })
    } else if (performedBy) {
      user = await prisma.user.findFirst({ where: { name: String(performedBy) } })
      if (!user) {
        // tạo email tổng hợp cho user được tạo
        const safe = String(performedBy).replace(/\s+/g, '_').toLowerCase()
        const email = `${safe}@local.invalid`
        user = await prisma.user.create({ data: { email, password: 'changeme', name: performedBy } })
      }
    } else {
      // fallback: sử dụng hoặc tạo user ẩn danh
      user = await prisma.user.findFirst()
      if (!user) user = await prisma.user.create({ data: { email: `user_${Date.now()}@local.invalid`, password: 'changeme' } })
    }

    // account: chấp nhận accountId (số) hoặc accountName
    let account = null
    if (accountId != null) {
      account = await prisma.account.findUnique({ where: { id: Number(accountId) } })
    }
    if (!account) {
      const name = accountName || 'Default'
      account = await prisma.account.upsert({ where: { name }, update: {}, create: { name, initialBalance: 0, currentBalance: 0 } })
    }

    // category: chấp nhận id số hoặc tên
    let category = null
    if (categoryId != null) {
      // thử id dạng số
      const maybeId = Number(categoryId)
      if (!Number.isNaN(maybeId)) category = await prisma.category.findUnique({ where: { id: maybeId } })
    }
    if (!category) {
      if (categoryName) {
        const cname = String(categoryName)
        category = await prisma.category.findFirst({ where: { name: cname } })
        if (!category) category = await prisma.category.create({ data: { name: cname, type: type === 'INCOME' ? 'INCOME' : 'EXPENSE' } })
      } else {
        return new Response(JSON.stringify({ error: 'Thiếu danh mục (categoryId hoặc categoryName)' }), { status: 400, headers: { 'content-type': 'application/json' } })
      }
    }

    const tx = await prisma.transaction.create({
      data: {
        amount,
        type: type as any,
        description: description || null,
        date: date ? new Date(date) : undefined,
        categoryId: category.id,
        accountId: account.id,
        userId: user.id
      }
    })
    console.debug('POST /api/transactions created:', tx)
    return new Response(JSON.stringify(tx), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('POST /api/transactions error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ nội bộ' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
