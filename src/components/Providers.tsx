'use client'

import BottomNav from '@/components/BottomNav'
import ActionModalProvider from '@/components/ActionModalProvider'
import { AuthProvider } from '@/context/AuthContext'

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ActionModalProvider>
        <div className="pb-32">{children}</div>
        <BottomNav />
      </ActionModalProvider>
    </AuthProvider>
  )
}

