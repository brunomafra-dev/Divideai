'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut, Mail, Lock, X } from 'lucide-react'
import Link from 'next/link'
import { ensureProfileForUser } from '@/lib/profiles'
import { AVATAR_PRESETS, getAvatarPresetUrl, getDefaultAvatarKey } from '@/lib/avatar-presets'
import UserAvatar from '@/components/user-avatar'
import BottomNav from '@/components/ui/bottom-nav'

interface UserProfile {
  id: string
  email: string
  username: string
  full_name: string
  is_premium: boolean
  avatar_key?: string
}

function normalizeUsername(raw: string) {
  return raw.trim().toLowerCase().replace(/\s+/g, '')
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [avatarKey, setAvatarKey] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    void loadProfile()
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
      setError('Nome de usuário é obrigatório')
      return
    }

    if (!cleanFullName) {
      setError('Nome completo é obrigatório')
      return
    }

    setSaving(true)
    try {
      const { data, error: updateError } = await supabase
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
        const code = String(updateError.code || '')
        if (code === '23505') {
          setError('Esse nome de usuário já está em uso. Escolha outro.')
          return
        }
        setError(updateError.message || 'Erro ao salvar perfil')
        return
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              username: data.username,
              full_name: data.full_name,
              is_premium: Boolean(data.is_premium),
              avatar_key: String((data as { avatar_key?: string }).avatar_key || ''),
            }
          : prev
      )

      setUsername(data.username)
      setFullName(data.full_name)
      setAvatarKey(String((data as { avatar_key?: string }).avatar_key || ''))
      setSuccess('Perfil atualizado com sucesso')
      setShowEditModal(false)
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!profile?.email) return

    setError('')
    setSuccess('')

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('Preencha senha atual, nova senha e confirmação.')
      return
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError('A confirmação da nova senha não confere.')
      return
    }

    setSavingPassword(true)
    try {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
      })

      if (reauthError) {
        setError('Senha atual inválida.')
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) {
        setError(updateError.message || 'Erro ao atualizar senha.')
        return
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setSuccess('Senha atualizada com sucesso.')
      setShowPasswordModal(false)
    } catch (err: any) {
      setError(err?.message || 'Erro ao atualizar senha.')
    } finally {
      setSavingPassword(false)
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
          <div className="w-12 h-12 border-4 border-[#5BC5A7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col overflow-x-hidden page-fade">
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

      <main className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-4 py-6 pb-[calc(8rem+env(safe-area-inset-bottom))]">
        <div className="surface-card p-6 mb-6">
          <div className="flex flex-col items-center mb-6">
            <UserAvatar
              name={profile?.full_name || profile?.username || 'Perfil'}
              avatarKey={avatarKey}
              isPremium={Boolean(profile?.is_premium)}
              className="w-24 h-24 mb-4"
              textClassName="text-2xl"
            />
            <p className="text-[#5BC5A7] text-sm mb-1">@{profile?.username || '-'}</p>
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
              <p className="text-sm text-gray-600 mb-1">Nome de usuário</p>
              <p className="font-medium text-gray-800">@{profile?.username || '-'}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Nome completo</p>
              <p className="font-medium text-gray-800">{profile?.full_name || '-'}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#5BC5A7]" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-medium text-gray-800">{profile?.email || '-'}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Plano</p>
              <p className="font-medium text-gray-800">{profile?.is_premium ? 'Premium' : 'Free'}</p>
            </div>

            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="w-full tap-target pressable bg-white border border-gray-300 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Alterar senha
            </button>

            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="w-full tap-target pressable bg-[#5BC5A7] text-white py-3 rounded-lg font-medium hover:bg-[#4AB396] transition-all"
            >
              Alterar perfil
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full tap-target pressable bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          type="button"
        >
          <LogOut className="w-5 h-5" />
          Sair da conta
        </button>
      </main>

      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center px-4 pt-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-4 space-y-4 max-h-[calc(100dvh-9rem-env(safe-area-inset-bottom))] sm:max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">Alterar perfil</h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="tap-target touch-friendly pressable text-gray-500 active:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Nome de usuário</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(normalizeUsername(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#5BC5A7]"
                  placeholder="seu_username"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Nome completo</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#5BC5A7]"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-3">Avatar</label>
                <div className="grid grid-cols-4 gap-3">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => setAvatarKey(preset.key)}
                      className={`pressable p-1.5 rounded-xl border-2 transition-all duration-200 ${
                        avatarKey === preset.key ? 'border-[#5BC5A7] bg-[#5BC5A7]/10 scale-[1.03]' : 'border-transparent hover:border-gray-200'
                      }`}
                      title={preset.label}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getAvatarPresetUrl(preset.key) || ''} alt={preset.label} className="w-12 h-12 rounded-full mx-auto" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full tap-target pressable bg-[#5BC5A7] text-white py-3 rounded-lg font-medium hover:bg-[#4AB396] transition-all disabled:opacity-50"
              type="button"
            >
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center px-4 pt-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-4 space-y-4 max-h-[calc(100dvh-9rem-env(safe-area-inset-bottom))] sm:max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">Alterar senha</h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="tap-target touch-friendly pressable text-gray-500 active:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#5BC5A7]"
                placeholder="Senha atual"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#5BC5A7]"
                placeholder="Nova senha"
              />
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#5BC5A7]"
                placeholder="Confirmar nova senha"
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={savingPassword}
              className="w-full tap-target pressable bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
              type="button"
            >
              {savingPassword ? 'Atualizando...' : 'Atualizar senha'}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
