'use client'

import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Category = 'apartment' | 'house' | 'trip' | 'other'

interface Participant {
  id: string
  name: string
  email?: string
}

const SELF_ID = 'self'

const categories: Array<{ id: Category; label: string; icon: string }> = [
  { id: 'apartment', label: 'Apartamento', icon: '🏢' },
  { id: 'house', label: 'Casa', icon: '🏠' },
  { id: 'trip', label: 'Viagem', icon: '✈️' },
  { id: 'other', label: 'Outro', icon: '📋' },
]

export default function CreateGroup() {
  const router = useRouter()

  const [groupName, setGroupName] = useState('')
  const [category, setCategory] = useState<Category>('other')
  const [participants, setParticipants] = useState<Participant[]>([{ id: SELF_ID, name: 'Voce' }])
  const [newParticipantName, setNewParticipantName] = useState('')
  const [newParticipantEmail, setNewParticipantEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const addParticipant = () => {
    const trimmedName = newParticipantName.trim()
    const trimmedEmail = newParticipantEmail.trim()

    if (!trimmedName) return

    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name: trimmedName,
      email: trimmedEmail || undefined,
    }

    setParticipants((prev) => [...prev, newParticipant])
    setNewParticipantName('')
    setNewParticipantEmail('')
  }

  const removeParticipant = (id: string) => {
    if (id === SELF_ID) return
    setParticipants((prev) => prev.filter((p) => p.id !== id))
  }

  const handleCreateGroup = async () => {
    const trimmedGroupName = groupName.trim()

    if (!trimmedGroupName || participants.length < 2) {
      alert('Adicione um nome e pelo menos 2 participantes')
      return
    }

    setLoading(true)
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('auth.getUser failed:', userError)
        alert('Usuario nao autenticado')
        return
      }

      const normalizedParticipants: Participant[] = participants.map((p) => {
        if (p.id !== SELF_ID) return p
        return {
          id: user.id,
          name: p.name,
          email: p.email ?? user.email ?? undefined,
        }
      })

      const insertPayload = {
        name: trimmedGroupName,
        category,
        owner_id: user.id,
        participants: normalizedParticipants,
      }

      const safePayloadLog = {
        name: insertPayload.name,
        category: insertPayload.category,
        owner_id: insertPayload.owner_id,
        participants: insertPayload.participants.map((p) => ({
          id: p.id,
          name: p.name,
          has_email: Boolean(p.email),
        })),
      }

      console.log('create-group.auth-user-id', { user_id: user.id })
      console.log('create-group.insert-payload', safePayloadLog)

      const { data, error, status } = await supabase
        .from('groups')
        .insert(insertPayload)
        .select('id')
        .single()

      if (error) {
        const rawError = error as unknown as Record<string, unknown>
        const fallbackMessage =
          typeof rawError.message === 'string' ? rawError.message : 'Erro ao criar grupo'
        const isRlsForbidden = status === 403 || rawError.code === '42501'

        console.error('create-group.insert-error', {
          status,
          code: rawError.code ?? null,
          message: rawError.message ?? null,
          details: rawError.details ?? null,
          hint: rawError.hint ?? null,
          raw: JSON.stringify(rawError, Object.getOwnPropertyNames(rawError)),
          user_id: user.id,
          payload: safePayloadLog,
        })

        alert(
          isRlsForbidden
            ? 'Sem permissao para criar grupo (RLS). Verifique a policy INSERT de groups.'
            : fallbackMessage
        )
        return
      }

      router.push(`/group/${data.id}`)
    } catch (e) {
      const err = e as Record<string, unknown>
      console.error('create-group.unexpected-error', {
        message: err?.message ?? null,
        stack: err?.stack ?? null,
        raw: JSON.stringify(err, Object.getOwnPropertyNames(err ?? {})),
      })
      alert('Erro inesperado ao criar grupo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <button className="text-gray-600 hover:text-gray-800" type="button">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">Criar grupo</h1>
          <button
            onClick={handleCreateGroup}
            className="text-[#5BC5A7] font-medium hover:text-[#4AB396]"
            disabled={loading}
            type="button"
          >
            Criar
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome do grupo</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Ex: Viagem para Praia"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5BC5A7]"
          />
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">Categoria</label>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  category === cat.id ? 'border-[#5BC5A7] bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                type="button"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-gray-700">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">Participantes ({participants.length})</label>

          <div className="space-y-2 mb-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span>{participant.name}</span>
                {participant.id !== SELF_ID && (
                  <button onClick={() => removeParticipant(participant.id)} type="button">
                    <X className="w-5 h-5 text-gray-400 hover:text-red-500" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-200">
            <input
              type="text"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              placeholder="Nome do participante"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
            <input
              type="email"
              value={newParticipantEmail}
              onChange={(e) => setNewParticipantEmail(e.target.value)}
              placeholder="Email (opcional)"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
            <button
              onClick={addParticipant}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#5BC5A7] text-white rounded-lg"
              type="button"
            >
              <Plus className="w-4 h-4" />
              Adicionar participante
            </button>
          </div>
        </div>

        <button
          onClick={handleCreateGroup}
          disabled={loading}
          className="w-full py-4 bg-[#5BC5A7] text-white rounded-xl font-medium"
          type="button"
        >
          {loading ? 'Criando...' : 'Criar grupo'}
        </button>
      </main>
    </div>
  )
}
