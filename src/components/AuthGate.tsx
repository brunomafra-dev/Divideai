'use client'

import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { hasLocalLegalConsent, setLocalLegalConsent } from '@/lib/legal-consent'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [legalLoading, setLegalLoading] = useState(false)
  const [needsLegalConsent, setNeedsLegalConsent] = useState(false)

  const isInviteRoute = pathname.startsWith('/invite/')
  const isLegalPublicRoute = pathname === '/privacy' || pathname === '/terms'
  const isMarketingRoute = pathname === '/' || pathname === '/download' || pathname === '/ios' || pathname === '/android'
  const isResetPasswordRoute = pathname === '/reset-password'
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/register' ||
    pathname === '/forgot-password'
  const isLegalConsentRoute = pathname === '/legal-consent'
  const isPublicRoute = isAuthRoute || isInviteRoute || isLegalPublicRoute || isMarketingRoute || isResetPasswordRoute
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const fromHash = window.location.hash.includes('type=recovery')
    const fromQuery = window.location.search.includes('type=recovery')
    setIsRecoveryFlow(fromHash || fromQuery)
  }, [pathname])

  useEffect(() => {
    const run = async () => {
      if (loading) return
      if (!user) {
        setNeedsLegalConsent(false)
        setLegalLoading(false)
        return
      }

      if (hasLocalLegalConsent(user.id)) {
        setNeedsLegalConsent(false)
        setLegalLoading(false)
        return
      }

      setLegalLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('terms_accepted_at,privacy_accepted_at')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('authgate.legal-check-error', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
      }

      const hasTerms = Boolean(data?.terms_accepted_at)
      const hasPrivacy = Boolean(data?.privacy_accepted_at)
      const accepted = hasTerms && hasPrivacy
      if (accepted) {
        setLocalLegalConsent(user.id, true)
      }
      setNeedsLegalConsent(!accepted)
      setLegalLoading(false)
    }

    void run()
  }, [loading, user?.id])

  useEffect(() => {
    if (loading || legalLoading) return

    if (!user && !isPublicRoute) {
      router.replace('/login')
      return
    }

    if (user && needsLegalConsent && !isLegalConsentRoute && !isResetPasswordRoute) {
      router.replace('/legal-consent')
      return
    }

    if (user && isRecoveryFlow && !isResetPasswordRoute) {
      router.replace('/reset-password')
      return
    }

    if (user && isAuthRoute && !needsLegalConsent && !isRecoveryFlow) {
      router.replace('/')
    }
  }, [user, loading, legalLoading, needsLegalConsent, isPublicRoute, isAuthRoute, isLegalConsentRoute, isRecoveryFlow, isResetPasswordRoute, router])

  if (loading || legalLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] dark:bg-neutral-950 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-[#5BC5A7] animate-spin" aria-label="Carregando" />
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
