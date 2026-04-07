export function getAuthRedirectUrl(pathname: string = '/auth/callback'): string {
  const safePath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${getCanonicalSiteUrl()}${safePath}`
}

function normalizePublicUrl(rawUrl: string | undefined | null): string | null {
  const value = String(rawUrl || '').trim()
  if (!value) return null

  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null
    }
    return parsed.origin.replace(/\/$/, '')
  } catch {
    return null
  }
}

export function getCanonicalSiteUrl(): string {
  const siteUrl = normalizePublicUrl(process.env.NEXT_PUBLIC_SITE_URL)
  if (siteUrl) return siteUrl

  return 'https://splitmateapp.vercel.app'
}

export function getRuntimeOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '')
  }

  return getCanonicalSiteUrl()
}

export function getAppBaseUrl(): string {
  return getRuntimeOrigin()
}

export function buildInviteLink(token: string): string {
  const safeToken = encodeURIComponent(String(token || '').trim())
  return `${getCanonicalSiteUrl()}/invite/${safeToken}`
}
