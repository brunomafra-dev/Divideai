'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { consumePendingProfileSeed, ensureProfileForUser } from '@/lib/profiles'
import { acceptInviteToken, clearPendingInviteToken, peekPendingInviteToken } from '@/lib/invites'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> => {
      const timeoutPromise = new Promise<T>((resolve) => {
        setTimeout(() => resolve(fallback), timeoutMs)
      })
      return Promise.race([promise, timeoutPromise])
    }

    const getSessionWithTimeout = async (timeoutMs: number) => {
      try {
        const result = (await withTimeout(
          supabase.auth.getSession(),
          timeoutMs,
          null
        )) as { data?: { session?: Session | null } } | null

        return result?.data?.session ?? null
      } catch (error) {
        console.error('auth.get-session-error', error)
        return null
      }
    }

    const ensureIdentity = async (sessionUser: User | null) => {
      if (!sessionUser) return

      const pendingSeed = consumePendingProfileSeed(sessionUser.id)
      try {
        await withTimeout(
          ensureProfileForUser(sessionUser, {
            username: pendingSeed?.username,
            fullName: pendingSeed?.fullName,
          }),
          5000,
          null
        )
      } catch (error) {
        const code = String((error as { code?: string })?.code || '')
        const message = String((error as { message?: string })?.message || '').toLowerCase()
        const expected =
          code === '42P01' ||
          code === '42501' ||
          message.includes('relation') ||
          message.includes('profiles') ||
          message.includes('permission denied')

        if (!expected) {
          console.error('auth.ensure-profile-error', error)
        }
      }

      const pendingInviteToken = peekPendingInviteToken()
      if (!pendingInviteToken) return

      try {
        const groupId = await withTimeout(
          acceptInviteToken(pendingInviteToken, sessionUser.id),
          5000,
          ''
        )
        if (!groupId) return
        clearPendingInviteToken()
        if (typeof window !== 'undefined' && window.location.pathname !== `/group/${groupId}`) {
          window.location.replace(`/group/${groupId}`)
        }
      } catch {
        // keep token for retry
      }
    }

    const init = async () => {
      const session = await getSessionWithTimeout(5000)
      if (cancelled) return
      setSession(session)
      setUser(session?.user ?? null)

      try {
        await ensureIdentity(session?.user ?? null)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return
      setSession(session)
      setUser(session?.user ?? null)
      try {
        await ensureIdentity(session?.user ?? null)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
