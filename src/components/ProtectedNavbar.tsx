'use client'

import { useAuth } from '@/context/AuthContext'
import BottomNav from '@/components/BottomNav'

export default function ProtectedNavbar() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return null

  return <BottomNav />
}

