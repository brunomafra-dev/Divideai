'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAuthRedirectUrl } from '@/lib/site-url'

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
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
        router.replace('/')
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
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] px-4">
      <form
        onSubmit={handleRegister}
        className="bg-white w-full max-w-sm p-6 rounded-xl shadow-sm space-y-4"
      >
        <h1 className="text-xl font-semibold text-gray-800 text-center">
          Criar conta
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#5BC5A7]"
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#5BC5A7]"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#5BC5A7] text-white py-2 rounded-lg font-medium disabled:opacity-60"
        >
          {loading ? 'Criando conta...' : 'Registrar'}
        </button>

        <p className="text-sm text-center text-gray-500">
          Ja tem conta?{' '}
          <Link href="/login" className="text-[#5BC5A7] font-medium">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  )
}
