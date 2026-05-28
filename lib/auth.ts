import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'board_session'

function getPassword() {
  const password = process.env.APP_PASSWORD
  if (!password) throw new Error('APP_PASSWORD is not configured')
  return password
}

function sign(value: string) {
  return createHmac('sha256', getPassword()).update(value).digest('hex')
}

function constantTimeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function verifyPassword(input: string) {
  return constantTimeEqual(sign(input), sign(getPassword()))
}

export function createSessionValue() {
  return `v1.${sign('authenticated')}`
}

export async function setSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, createSessionValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === createSessionValue()
}
