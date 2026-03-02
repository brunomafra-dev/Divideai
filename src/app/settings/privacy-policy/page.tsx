'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BottomNav from '@/components/ui/bottom-nav'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-[calc(6rem+env(safe-area-inset-bottom))]">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/settings">
            <button type="button" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">Politica de privacidade</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <article className="bg-white rounded-xl p-5 space-y-4 text-sm text-gray-700 leading-6">
          <p>Seus dados sao usados somente para fazer o aplicativo funcionar: login, grupos, participantes e registros de gastos.</p>
          <p>Nosso objetivo e proteger suas informacoes e reduzir ao maximo qualquer exposicao desnecessaria.</p>
          <p>Voce controla o que deseja mostrar no app pelas configuracoes de privacidade da sua conta.</p>
          <p>Nos nao vendemos seus dados para terceiros.</p>
          <p>Se quiser atualizar ou remover informacoes da conta, voce pode solicitar pelos canais de suporte.</p>
        </article>
      </main>

      <BottomNav />
    </div>
  )
}
