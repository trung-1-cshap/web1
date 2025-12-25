import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_FILE = path.resolve(process.cwd(), 'data', 'customers.json')

async function ensureDataFile() {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
    await fs.access(DATA_FILE)
  } catch (e) {
    // tạo file mảng rỗng
    await fs.writeFile(DATA_FILE, JSON.stringify([]), 'utf8')
  }
}

export async function GET() {
  try {
    await ensureDataFile()
    const txt = await fs.readFile(DATA_FILE, 'utf8')
    const data = JSON.parse(txt || '[]')
    return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('GET /api/customers error', err)
    return new Response(JSON.stringify([]), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    await ensureDataFile()
    const txt = await fs.readFile(DATA_FILE, 'utf8')
    const arr = JSON.parse(txt || '[]')
    const id = `c${Date.now()}`
    const item = { id, ...payload }
    arr.unshift(item)
    await fs.writeFile(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8')
    return new Response(JSON.stringify(item), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('POST /api/customers error', err)
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ nội bộ' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...patch } = body
    if (!id) return new Response(JSON.stringify({ error: 'Thiếu id' }), { status: 400, headers: { 'content-type': 'application/json' } })
    await ensureDataFile()
    const txt = await fs.readFile(DATA_FILE, 'utf8')
    const arr = JSON.parse(txt || '[]')
    let updated = null
    const next = arr.map((c: any) => {
      if (c.id === id) {
        updated = { ...c, ...patch }
        return updated
      }
      return c
    })
    await fs.writeFile(DATA_FILE, JSON.stringify(next, null, 2), 'utf8')
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('PUT /api/customers error', err)
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ nội bộ' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body
    if (!id) return new Response(JSON.stringify({ error: 'Thiếu id' }), { status: 400, headers: { 'content-type': 'application/json' } })
    await ensureDataFile()
    const txt = await fs.readFile(DATA_FILE, 'utf8')
    const arr = JSON.parse(txt || '[]')
    const next = arr.filter((c: any) => c.id !== id)
    await fs.writeFile(DATA_FILE, JSON.stringify(next, null, 2), 'utf8')
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('DELETE /api/customers error', err)
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ nội bộ' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
