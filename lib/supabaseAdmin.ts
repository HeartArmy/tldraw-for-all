import { createClient } from '@supabase/supabase-js'

export const DRAWING_ID = process.env.DRAWING_ID || 'main'
export const ASSET_BUCKET = process.env.SUPABASE_ASSET_BUCKET || 'tldraw-assets'

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
