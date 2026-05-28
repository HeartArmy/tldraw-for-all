export function toAssetUrl(path: string, origin = '') {
  const url = `/api/assets/file?path=${encodeURIComponent(path)}`
  return origin ? new URL(url, origin).toString() : url
}

export function getAssetPath(src: string) {
  const url = new URL(src, 'https://local.invalid')
  if (url.pathname === '/api/assets/file') {
    return url.searchParams.get('path')
  }

  return src
}
