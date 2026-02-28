export function getAuthRedirectUrl(pathname: string = '/auth/callback'): string {
  const safePath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${getAppBaseUrl()}${safePath}`
}

export function getAppBaseUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (siteUrl) {
    return siteUrl.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '')
  }

  throw new Error('NEXT_PUBLIC_SITE_URL is required')
}

export function buildInviteLink(token: string): string {
  const safeToken = String(token || '').trim()
  return `${getAppBaseUrl()}/invite/${safeToken}`
}
