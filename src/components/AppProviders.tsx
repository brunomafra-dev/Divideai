'use client'

import { AuthProvider } from '@/context/AuthContext'
import { AuthGate } from '@/components/AuthGate'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { usePremium } from '@/hooks/use-premium'

function PremiumThemeGuard() {
  const { isPremium, premiumResolved } = usePremium()
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    if (!premiumResolved) return
    if (!isPremium && resolvedTheme === 'dark') {
      setTheme('light')
    }
  }, [isPremium, premiumResolved, resolvedTheme, setTheme])

  return null
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <PremiumThemeGuard />
        <AuthGate>{children}</AuthGate>
      </AuthProvider>
    </ThemeProvider>
  )
}
