'use client'

import Link from 'next/link'
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react'
import BottomNav from '@/components/ui/bottom-nav'

const supportEmail = 'suporte@divideai.app'
const whatsappNumber = '5511999999999'

export default function SupportPage() {
  const subject = encodeURIComponent('Suporte Divide Ai')
  const body = encodeURIComponent('Ola, preciso de ajuda com o app Divide Ai.')
  const mailto = `mailto:${supportEmail}?subject=${subject}&body=${body}`
  const whatsapp = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Ola, preciso de ajuda com o Divide Ai.')}`

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-[calc(6rem+env(safe-area-inset-bottom))]">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/settings">
            <button type="button" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">Ajuda e suporte</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-3">
        <a href={mailto} className="bg-white rounded-xl p-4 flex items-center justify-between" target="_blank" rel="noreferrer">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-[#5BC5A7]" />
            <div>
              <p className="text-sm font-medium text-gray-800">Contato por e-mail</p>
              <p className="text-xs text-gray-500">{supportEmail}</p>
            </div>
          </div>
          <span className="text-xs text-gray-500">Abrir</span>
        </a>

        <a href={whatsapp} className="bg-white rounded-xl p-4 flex items-center justify-between" target="_blank" rel="noreferrer">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-[#5BC5A7]" />
            <div>
              <p className="text-sm font-medium text-gray-800">Contato por WhatsApp</p>
              <p className="text-xs text-gray-500">Atendimento rapido</p>
            </div>
          </div>
          <span className="text-xs text-gray-500">Abrir</span>
        </a>
      </main>

      <BottomNav />
    </div>
  )
}
