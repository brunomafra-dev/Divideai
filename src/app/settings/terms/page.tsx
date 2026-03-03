'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BottomNav from '@/components/ui/bottom-nav'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-[calc(6rem+env(safe-area-inset-bottom))] page-fade">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/settings">
            <button type="button" className="tap-target pressable text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="section-title">Termos de uso</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <article className="surface-card p-5 space-y-4 text-sm text-gray-700 leading-6">
          <p>O Divide Aí foi criado para ajudar você e seu grupo a organizar despesas de forma simples e transparente.</p>
          <p>Ao usar o app, você concorda em registrar informações verdadeiras e respeitar os demais participantes.</p>
          <p>Os pagamentos e as confirmações são controlados pelo próprio grupo. Por isso, sempre confirme com as pessoas envolvidas antes de marcar algo como quitado.</p>
          <p>Nós nos comprometemos a manter o aplicativo funcionando com segurança e estabilidade, mas podemos fazer melhorias e ajustes ao longo do tempo.</p>
          <p>Se houver uso indevido, comportamento abusivo ou tentativa de fraude, o acesso poderá ser limitado para proteger os demais usuários.</p>
        </article>
      </main>

      <BottomNav />
    </div>
  )
}
