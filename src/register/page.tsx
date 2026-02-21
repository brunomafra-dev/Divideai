'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { getAuthRedirectUrl } from '@/lib/site-url'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleRegister() {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const redirectTo = getAuthRedirectUrl('/auth/callback')

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (data.session) {
        router.push('/')
        return
      }

      setSuccess('Cadastro realizado! Verifique seu email para confirmar a conta.')
      setLoading(false)
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar conta')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] px-6">
      <div className="bg-white p-6 rounded-xl shadow-sm w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-center">Criar conta</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg px-4 py-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full border rounded-lg px-4 py-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-[#5BC5A7] text-white py-2 rounded-lg"
        >
          {loading ? 'Criando...' : 'Criar conta'}
        </button>
      </div>
    </div>
  )
}
