import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getAssetPath } from '@/lib/assets'
import { ASSET_BUCKET, DRAWING_ID, getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const pathParam = url.searchParams.get('path')
  const path = pathParam ? getAssetPath(pathParam) : null

  if (!path || path.includes('..') || !path.startsWith(`${DRAWING_ID}/`)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.storage.from(ASSET_BUCKET).download(path)

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Asset not found' }, { status: 404 })
  }

  return new NextResponse(data, {
    headers: {
      'cache-control': 'private, max-age=300',
      'content-type': data.type || 'application/octet-stream',
    },
  })
}
