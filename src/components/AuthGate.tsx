'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isInviteRoute = pathname.startsWith('/invite/')
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'

  const isPublicRoute = isAuthRoute || isInviteRoute

  useEffect(() => {
    if (loading) return

    // Se não tem usuário e não está em rota pública, redireciona para login
    if (!user && !isPublicRoute) {
      router.replace('/login')
    }

    // Se tem usuário e está em rota pública, redireciona para home
    if (user && isAuthRoute) {
      router.replace('/')
    }
  }, [user, loading, isPublicRoute, isAuthRoute, router, pathname])

  // Mostrar loading enquanto verifica sessão
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5BC5A7] to-[#4AB396] flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    )
  }

  // Se não tem usuário e não está em rota pública, não renderiza nada (vai redirecionar)
  if (!user && !isPublicRoute) {
    return null
  }

  // Se tem usuário e está em rota pública, não renderiza nada (vai redirecionar)
  if (user && isAuthRoute) {
    return null
  }

  return <>{children}</>
}
