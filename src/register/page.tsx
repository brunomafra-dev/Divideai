'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { getAuthRedirectUrl } from '@/lib/site-url'
import { ensureProfileForUser, savePendingProfileSeed } from '@/lib/profiles'

function normalizeUsername(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleRegister() {
    setLoading(true)
    setError(null)
    setSuccess(null)

    const cleanUsername = normalizeUsername(username)
    const cleanFullName = fullName.trim()

    if (!cleanUsername) {
      setError('Username invalido. Use letras, numeros e underscore.')
      setLoading(false)
      return
    }

    if (!cleanFullName) {
      setError('Nome completo e obrigatorio')
      setLoading(false)
      return
    }

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

      if (!data.user) {
        setError('Não foi possivel criar usuário')
        setLoading(false)
        return
      }

      savePendingProfileSeed({ userId: data.user.id, username: cleanUsername, fullName: cleanFullName })

      try {
        await ensureProfileForUser(data.user, {
          username: cleanUsername,
          fullName: cleanFullName,
        })
      } catch (profileError: any) {
        const profileMessage = String(profileError?.message || '').toLowerCase()
        const profileCode = String(profileError?.code || '')
        const duplicate = profileCode === '23505' || profileMessage.includes('username_already_taken') || profileMessage.includes('duplicate')

        if (duplicate) {
          await supabase.auth.signOut()
          setError('Esse username ja esta em uso. Escolha outro.')
          setLoading(false)
          return
        }

        if (data.session) {
          await supabase.auth.signOut()
          setError('Falha ao criar perfil. Tente novamente.')
          setLoading(false)
          return
        }
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
          type="text"
          placeholder="Username"
          className="w-full border rounded-lg px-4 py-2"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <input
          type="text"
          placeholder="Nome completo"
          className="w-full border rounded-lg px-4 py-2"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
        />

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
