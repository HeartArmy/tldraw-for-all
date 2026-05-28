import { NextResponse } from 'next/server'
import { toAssetUrl } from '@/lib/assets'
import { isAuthenticated } from '@/lib/auth'
import { DRAWING_ID, getSupabaseAdmin } from '@/lib/supabaseAdmin'

function normalizeAssetUrls(value: unknown, origin: string): unknown {
  if (Array.isArray(value)) return value.map((child) => normalizeAssetUrls(child, origin))

  if (!value || typeof value !== 'object') return value

  const record = value as Record<string, unknown>
  const next: Record<string, unknown> = {}

  for (const [key, child] of Object.entries(record)) {
    next[key] = normalizeAssetUrls(child, origin)
  }

  const props = next.props
  if (
    next.typeName === 'asset' &&
    props &&
    typeof props === 'object' &&
    typeof (props as Record<string, unknown>).src === 'string'
  ) {
    const src = (props as Record<string, string>).src
    if (src && !src.startsWith('/') && !src.includes('://') && !src.startsWith('data:')) {
      next.props = { ...(props as Record<string, unknown>), src: toAssetUrl(src, origin) }
    }
  }

  return next
}

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('drawings')
    .select('snapshot')
    .eq('id', DRAWING_ID)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    snapshot: normalizeAssetUrls(data?.snapshot ?? null, new URL(request.url).origin),
  })
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as { snapshot?: unknown } | null
  if (!body?.snapshot || typeof body.snapshot !== 'object') {
    return NextResponse.json({ error: 'Invalid snapshot' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('drawings').upsert({
    id: DRAWING_ID,
    snapshot: normalizeAssetUrls(body.snapshot, new URL(request.url).origin),
    updated_at: new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
