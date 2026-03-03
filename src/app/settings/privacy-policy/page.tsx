'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BottomNav from '@/components/ui/bottom-nav'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-[calc(6rem+env(safe-area-inset-bottom))] page-fade">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/settings">
            <button type="button" className="tap-target pressable text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="section-title">Política de privacidade</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <article className="surface-card p-5 space-y-4 text-sm text-gray-700 leading-6">
          <p>Seus dados são usados somente para fazer o aplicativo funcionar: login, grupos, participantes e registros de gastos.</p>
          <p>Nosso objetivo é proteger suas informações e reduzir, ao máximo, qualquer exposição desnecessária.</p>
          <p>Você controla o que deseja mostrar no app pelas configurações de privacidade da sua conta.</p>
          <p>Nós não vendemos seus dados para terceiros.</p>
          <p>Se quiser atualizar ou remover informações da conta, você pode solicitar pelos canais de suporte.</p>
        </article>
      </main>

      <BottomNav />
    </div>
  )
}
