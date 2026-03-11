'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LegalDocModal from '@/components/legal-doc-modal'

export default function LegalConsentPage() {
  const router = useRouter()
  const [termsViewed, setTermsViewed] = useState(false)
  const [privacyViewed, setPrivacyViewed] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null)

  const handleContinue = async () => {
    setError('')
    if (!accepted) {
      setError('Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        terms_accepted_at: new Date().toISOString(),
        privacy_accepted_at: new Date().toISOString(),
      })
      .eq('id', (await supabase.auth.getUser()).data.user?.id || '')

    if (updateError) {
      setError('Erro ao registrar aceite. Tente novamente.')
      setLoading(false)
      return
    }

    router.replace('/')
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4">
      <div className="surface-card w-full max-w-md p-6 space-y-4">
        <h1 className="text-xl font-semibold text-gray-800">Aceite obrigatório</h1>
        <p className="text-sm text-gray-600">Para continuar usando o DivideAI, leia e aceite os documentos legais.</p>

        <div className="rounded-lg border border-gray-200 p-3 bg-gray-50 space-y-2">
          <button type="button" onClick={() => setLegalModal('terms')} className="text-sm text-[#5BC5A7] underline">
            Ler Termos de Uso
          </button>
          <button type="button" onClick={() => setLegalModal('privacy')} className="ml-3 text-sm text-[#5BC5A7] underline">
            Ler Política de Privacidade
          </button>

          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={accepted}
              disabled={!termsViewed || !privacyViewed}
              onChange={(e) => {
                if (!termsViewed || !privacyViewed) {
                  setError('Leia os dois documentos antes de aceitar.')
                  return
                }
                setAccepted(e.target.checked)
              }}
              className="mt-1"
            />
            <span>Li e aceito os Termos de Uso e a Política de Privacidade</span>
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className="w-full tap-target touch-friendly pressable bg-[#5BC5A7] text-white py-2.5 rounded-lg font-medium active:bg-[#4AB396] disabled:opacity-60"
        >
          {loading ? 'Salvando...' : 'Continuar'}
        </button>
      </div>

      <LegalDocModal
        open={legalModal !== null}
        type={legalModal || 'terms'}
        onClose={() => setLegalModal(null)}
        onViewed={() => {
          if (legalModal === 'terms') setTermsViewed(true)
          if (legalModal === 'privacy') setPrivacyViewed(true)
        }}
      />
    </div>
  )
}
