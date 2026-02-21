export function getAuthRedirectUrl(pathname: string = '/auth/callback'): string {
  const safePath = pathname.startsWith('/') ? pathname : `/${pathname}`

  if (typeof window !== 'undefined') {
    return `${window.location.origin}${safePath}`
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL is required for server-side redirect URLs')
  }

  return `${siteUrl.replace(/\/$/, '')}${safePath}`
}
