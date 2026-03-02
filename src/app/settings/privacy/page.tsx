'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/ui/bottom-nav'

export default function PrivacySettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [profileVisible, setProfileVisible] = useState(true)
  const [showBalance, setShowBalance] = useState(true)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('privacy_profile_visible,privacy_show_balance')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setProfileVisible(Boolean(data.privacy_profile_visible))
        setShowBalance(Boolean(data.privacy_show_balance))
      }

      setLoading(false)
    }

    load()
  }, [router])

  const updateSetting = async (column: 'privacy_profile_visible' | 'privacy_show_balance', value: boolean) => {
    setSaving(column)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.replace('/login')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ [column]: value })
      .eq('id', user.id)

    if (error) {
      console.error('settings.privacy.update-error', error)
      if (column === 'privacy_profile_visible') setProfileVisible(!value)
      if (column === 'privacy_show_balance') setShowBalance(!value)
    }

    setSaving(null)
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-[calc(6rem+env(safe-area-inset-bottom))] page-fade">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/settings">
            <button type="button" className="tap-target pressable text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="section-title">Privacidade</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-3">
        {loading ? (
          <div className="surface-card p-4 text-sm text-gray-600">Carregando...</div>
        ) : (
          <>
            <div className="surface-card p-4 flex items-center justify-between">
              <span className="text-sm text-gray-800">Exibir meu perfil para participantes</span>
              <button
                type="button"
                disabled={saving === 'privacy_profile_visible'}
                onClick={() => {
                  const next = !profileVisible
                  setProfileVisible(next)
                  updateSetting('privacy_profile_visible', next)
                }}
                className={`tap-target pressable w-12 h-7 rounded-full p-1 transition ${profileVisible ? 'bg-[#5BC5A7]' : 'bg-gray-300'} disabled:opacity-50`}
              >
                <span className={`block w-5 h-5 rounded-full bg-white transition ${profileVisible ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="surface-card p-4 flex items-center justify-between">
              <span className="text-sm text-gray-800">Exibir meu saldo nos grupos</span>
              <button
                type="button"
                disabled={saving === 'privacy_show_balance'}
                onClick={() => {
                  const next = !showBalance
                  setShowBalance(next)
                  updateSetting('privacy_show_balance', next)
                }}
                className={`tap-target pressable w-12 h-7 rounded-full p-1 transition ${showBalance ? 'bg-[#5BC5A7]' : 'bg-gray-300'} disabled:opacity-50`}
              >
                <span className={`block w-5 h-5 rounded-full bg-white transition ${showBalance ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
