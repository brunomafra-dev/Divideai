'use client'

import { AuthProvider } from '@/context/AuthContext'
import { AuthGate } from '@/components/AuthGate'
import { ThemeProvider } from '@/components/ui/theme-provider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <AuthGate>{children}</AuthGate>
      </AuthProvider>
    </ThemeProvider>
  )
}
