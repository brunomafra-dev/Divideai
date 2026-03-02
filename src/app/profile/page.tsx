'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut, User, Mail } from 'lucide-react'
import Link from 'next/link'
import { ensureProfileForUser } from '@/lib/profiles'
import { AVATAR_PRESETS, getAvatarPresetUrl, getDefaultAvatarKey } from '@/lib/avatar-presets'
import UserAvatar from '@/components/user-avatar'

interface UserProfile {
  id: string
  email: string
  username: string
  full_name: string
  is_premium: boolean
  avatar_key?: string
}

function normalizeUsername(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [avatarKey, setAvatarKey] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const ensured = await ensureProfileForUser(user)

      const resolved: UserProfile = {
        id: user.id,
        email: user.email || '',
        username: ensured.username,
        full_name: ensured.full_name,
        is_premium: Boolean(ensured.is_premium),
        avatar_key: String((ensured as { avatar_key?: string }).avatar_key || ''),
      }

      setProfile(resolved)
      setUsername(resolved.username)
      setFullName(resolved.full_name)
      const resolvedAvatarKey = resolved.avatar_key || getDefaultAvatarKey(user.id)
      setAvatarKey(resolvedAvatarKey)

      if (!resolved.avatar_key) {
        await supabase.from('profiles').update({ avatar_key: resolvedAvatarKey }).eq('id', user.id)
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setError('')
    setSuccess('')

    const cleanUsername = normalizeUsername(username)
    const cleanFullName = fullName.trim()

    if (!cleanUsername) {
      setError('Username e obrigatorio')
      return
    }

    if (!cleanFullName) {
      setError('Nome completo e obrigatorio')
      return
    }

    setSaving(true)
    try {
      let { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          username: cleanUsername,
          full_name: cleanFullName,
          avatar_key: avatarKey || null,
        })
        .eq('id', profile.id)
        .select('username,full_name,is_premium,avatar_key')
        .single()

      if (updateError) {
        const fallback = await supabase
          .from('profiles')
          .update({
            username: cleanUsername,
            full_name: cleanFullName,
          })
          .eq('id', profile.id)
          .select('username,full_name,is_premium')
          .single()

        if (!fallback.error) {
          data = fallback.data as typeof data
          updateError = null
        }
      }

      if (updateError) {
        const code = String(updateError.code || '')
        if (code === '23505') {
          setError('Esse username ja esta em uso. Escolha outro.')
          return
        }
        setError(updateError.message || 'Erro ao salvar perfil')
        return
      }

      setProfile((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          username: data.username,
          full_name: data.full_name,
          is_premium: Boolean(data.is_premium),
          avatar_key: String((data as { avatar_key?: string }).avatar_key || ''),
        }
      })

      setUsername(data.username)
      setFullName(data.full_name)
      setAvatarKey(String((data as { avatar_key?: string }).avatar_key || ''))
      setSuccess('Perfil atualizado com sucesso')
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err: any) {
      setError(err?.message || 'Erro ao fazer logout')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#5BC5A7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" type="button">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Perfil</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center mb-6">
            <UserAvatar name={fullName || username} avatarKey={avatarKey} className="w-24 h-24 mb-4" textClassName="text-2xl" />
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{fullName || 'Sem nome'}</h2>
            <p className="text-[#5BC5A7] text-sm mb-1">@{username || '-'}</p>
            <p className="text-gray-600">{profile?.email}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm text-gray-600 mb-2">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(normalizeUsername(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#5BC5A7]"
                placeholder="seu_username"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm text-gray-600 mb-2">Nome completo</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#5BC5A7]"
                placeholder="Seu nome completo"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm text-gray-600 mb-3">Avatar</label>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => setAvatarKey(preset.key)}
                    className={`p-1 rounded-lg border-2 ${avatarKey === preset.key ? 'border-[#5BC5A7]' : 'border-transparent'}`}
                    title={preset.label}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getAvatarPresetUrl(preset.key) || ''} alt={preset.label} className="w-12 h-12 rounded-full mx-auto" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-[#5BC5A7]" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">E-mail</p>
                <p className="font-medium text-gray-800">{profile?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-[#5BC5A7]" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Plano</p>
                <p className="font-medium text-gray-800">{profile?.is_premium ? 'Premium' : 'Free'}</p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#5BC5A7] text-white py-3 rounded-lg font-medium hover:bg-[#4AB396] transition-all disabled:opacity-50"
              type="button"
            >
              {saving ? 'Salvando...' : 'Salvar perfil'}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          type="button"
        >
          <LogOut className="w-5 h-5" />
          Sair da conta
        </button>
      </main>
    </div>
  )
}
