import { NextResponse } from 'next/server'
import { setSessionCookie, verifyPassword } from '@/lib/auth'

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!verifyPassword(password)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  await setSessionCookie()
  return NextResponse.json({ ok: true })
}
