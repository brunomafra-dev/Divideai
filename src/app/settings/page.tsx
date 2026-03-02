'use client'

import { ArrowLeft, Crown, ChevronRight, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/ui/bottom-nav'
import packageJson from '../../../package.json'

export default function Settings() {
  const router = useRouter()
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)
  const appVersion = useMemo(() => String((packageJson as { version?: string }).version || '0.0.0'), [])

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .maybeSingle()

      setIsPremium(Boolean(data?.is_premium))
      setLoading(false)
    }

    load()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-[calc(6rem+env(safe-area-inset-bottom))] page-fade">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <button className="tap-target pressable text-gray-600 hover:text-gray-800" type="button">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="section-title">Conta</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-gradient-to-br from-[#5BC5A7] to-[#4AB396] rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center gap-3 mb-3">
            <Crown className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Divide Ai Premium</h2>
          </div>
          <p className="text-white/90 mb-4">Plano atual: {isPremium ? 'Premium' : 'Free'}</p>
          <button className="w-full tap-target pressable bg-white text-[#5BC5A7] py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors" type="button">
            {isPremium ? 'Gerenciar assinatura' : 'Assinar Premium'}
          </button>
        </div>

        <div className="surface-card overflow-hidden">
          <h3 className="text-sm font-medium text-gray-700 px-4 py-3 bg-gray-50">Conta</h3>
          <div className="divide-y divide-gray-100">
            <Link href="/profile" className="tap-target px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors">
              <span className="text-sm text-gray-800">Perfil</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </Link>
            <Link href="/settings/notifications" className="tap-target px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors">
              <span className="text-sm text-gray-800">Notificacoes</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </Link>
            <Link href="/settings/privacy" className="tap-target px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors">
              <span className="text-sm text-gray-800">Privacidade</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </Link>
          </div>
        </div>

        <div className="surface-card overflow-hidden">
          <h3 className="text-sm font-medium text-gray-700 px-4 py-3 bg-gray-50">Sobre</h3>
          <div className="divide-y divide-gray-100">
            <Link href="/settings/terms" className="tap-target px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors">
              <span className="text-sm text-gray-800">Termos de uso</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </Link>
            <Link href="/settings/privacy-policy" className="tap-target px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors">
              <span className="text-sm text-gray-800">Politica de privacidade</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </Link>
            <Link href="/settings/support" className="tap-target px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors">
              <span className="text-sm text-gray-800">Ajuda e suporte</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </Link>
            <Link href="/settings/about" className="tap-target px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors">
              <span className="text-sm text-gray-500">Versao {appVersion}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>

        {!loading && !isPremium && (
          <div className="bg-gray-100 rounded-xl p-4 text-center border-2 border-dashed border-gray-300">
            <p className="text-xs text-gray-500">Espaco de anuncio ativo no plano Free</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full tap-target pressable bg-white rounded-xl shadow-sm px-4 py-3 text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          type="button"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </main>

      <BottomNav />
    </div>
  )
}
