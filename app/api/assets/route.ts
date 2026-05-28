import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { ASSET_BUCKET, DRAWING_ID, getSupabaseAdmin } from '@/lib/supabaseAdmin'

const MAX_FILE_SIZE = 20 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/gif', 'image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'])

function cleanId(value: string) {
  return value.replace(/[^a-zA-Z0-9:_-]/g, '-')
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const assetId = formData.get('assetId')

  if (!(file instanceof File) || typeof assetId !== 'string') {
    return NextResponse.json({ error: 'Invalid upload' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Unsupported or too large' }, { status: 400 })
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${DRAWING_ID}/${cleanId(assetId)}/${randomUUID()}.${extension}`
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage.from(ASSET_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ path })
}
