'use client'

import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [legalLoading, setLegalLoading] = useState(true)
  const [needsLegalConsent, setNeedsLegalConsent] = useState(false)

  const isInviteRoute = pathname.startsWith('/invite/')
  const isLegalPublicRoute = pathname === '/privacy' || pathname === '/terms'
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'
  const isLegalConsentRoute = pathname === '/legal-consent'
  const isPublicRoute = isAuthRoute || isInviteRoute || isLegalPublicRoute

  useEffect(() => {
    const run = async () => {
      if (loading) return
      if (!user) {
        setNeedsLegalConsent(false)
        setLegalLoading(false)
        return
      }

      setLegalLoading(true)
      const { data } = await supabase
        .from('profiles')
        .select('terms_accepted_at,privacy_accepted_at')
        .eq('id', user.id)
        .maybeSingle()

      const hasTerms = Boolean(data?.terms_accepted_at)
      const hasPrivacy = Boolean(data?.privacy_accepted_at)
      setNeedsLegalConsent(!(hasTerms && hasPrivacy))
      setLegalLoading(false)
    }

    run()
  }, [loading, user?.id])

  useEffect(() => {
    if (loading || legalLoading) return

    if (!user && !isPublicRoute) {
      router.replace('/login')
      return
    }

    if (user && needsLegalConsent && !isLegalConsentRoute) {
      router.replace('/legal-consent')
      return
    }

    if (user && isAuthRoute && !needsLegalConsent) {
      router.replace('/')
    }
  }, [user, loading, legalLoading, needsLegalConsent, isPublicRoute, isAuthRoute, isLegalConsentRoute, router])

  if (loading || legalLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5BC5A7] to-[#4AB396] flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    )
  }

  if (!user && !isPublicRoute) {
    return null
  }

  if (user && isAuthRoute && !needsLegalConsent) {
    return null
  }

  if (user && needsLegalConsent && !isLegalConsentRoute) {
    return null
  }

  return <>{children}</>
}
