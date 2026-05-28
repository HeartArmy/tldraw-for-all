'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DefaultSpinner,
  TLAsset,
  TLAssetStore,
  TLEditorSnapshot,
  Tldraw,
  createTLStore,
  getSnapshot,
  loadSnapshot,
} from 'tldraw'
import 'tldraw/tldraw.css'
import { toAssetUrl } from '@/lib/assets'

type LoadState = 'loading' | 'ready' | 'error'

function makeAssetStore(): TLAssetStore {
  return {
    async upload(asset: TLAsset, file: File, abortSignal?: AbortSignal) {
      const formData = new FormData()
      formData.append('assetId', asset.id)
      formData.append('file', file)

      const response = await fetch('/api/assets', {
        method: 'POST',
        body: formData,
        signal: abortSignal,
      })

      if (!response.ok) throw new Error('Asset upload failed')

      const result = (await response.json()) as { path: string }
      return {
        src: toAssetUrl(result.path, window.location.origin),
        meta: { storagePath: result.path },
      }
    },

    resolve(asset: TLAsset) {
      const src = asset.props.src
      if (!src) return null
      return src.includes('/api/assets/file?') ? src : toAssetUrl(src, window.location.origin)
    },
  }
}

export default function Board() {
  const assets = useMemo(() => makeAssetStore(), [])
  const store = useMemo(() => createTLStore({ assets }), [assets])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const saveTimer = useRef<number | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function load() {
      const response = await fetch('/api/drawing')
      if (!response.ok) {
        setLoadState('error')
        return
      }

      const { snapshot } = (await response.json()) as { snapshot: TLEditorSnapshot | null }
      if (!isCancelled && snapshot) loadSnapshot(store, snapshot)
      if (!isCancelled) setLoadState('ready')
    }

    load().catch(() => {
      if (!isCancelled) setLoadState('error')
    })

    return () => {
      isCancelled = true
    }
  }, [store])

  if (loadState === 'loading') {
    return (
      <div className="editor-status">
        <DefaultSpinner />
      </div>
    )
  }

  if (loadState === 'error') {
    return <div className="editor-status">Could not load the board.</div>
  }

  return (
    <div className="editor-shell">
      <Tldraw
        licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
        store={store}
        onMount={(editor) => {
          return editor.store.listen(
            () => {
              if (saveTimer.current) window.clearTimeout(saveTimer.current)

              saveTimer.current = window.setTimeout(async () => {
                await fetch('/api/drawing', {
                  method: 'PUT',
                  body: JSON.stringify({ snapshot: getSnapshot(editor.store) }),
                  headers: { 'content-type': 'application/json' },
                })
              }, 700)
            },
            { source: 'user', scope: 'document' }
          )
        }}
      />
    </div>
  )
}
