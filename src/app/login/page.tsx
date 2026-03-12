'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import AppBrand from '@/components/app-brand'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkSession = async () => {
      if (typeof window !== 'undefined') {
        const isRecovery =
          window.location.hash.includes('type=recovery') ||
          window.location.search.includes('type=recovery')
        if (isRecovery) {
          router.replace('/reset-password')
          return
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        router.replace('/')
      }
    }
    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        throw new Error('Sessão Não foi criada. Tente novamente.')
      }

      router.replace('/')
      router.refresh()
    } catch (err: any) {
      const authCode = String(err?.code || '')
      const authMessage = String(err?.message || '').toLowerCase()
      if (authCode === 'invalid_credentials' || authMessage.includes('invalid login credentials')) {
        setError('E-mail ou senha inválidos')
      } else {
        setError(err?.message || 'Erro ao fazer login. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5BC5A7] to-[#4AB396] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <AppBrand
            className="justify-center mb-2"
            iconClassName="w-6 h-6"
            textClassName="text-4xl font-bold text-white"
          />
          <p className="text-white/90 text-lg">Divida gastos com facilidade</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Entrar</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BC5A7] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BC5A7] focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-[#5BC5A7] hover:text-[#4AB396] transition-colors">
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5BC5A7] text-white py-3 rounded-lg font-medium hover:bg-[#4AB396] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link href="/signup" className="text-[#5BC5A7] font-medium hover:text-[#4AB396] transition-colors">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/80 text-sm mt-6">
          Ao continuar, Você concorda com nossos Termos de Uso
        </p>
      </div>
    </div>
  )
}

