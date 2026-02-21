'use client'

import { ArrowLeft, Plus, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Category = 'apartment' | 'house' | 'trip' | 'other'

interface Participant {
  id: string
  name: string
  email?: string
}

const categories: Array<{ id: Category; label: string; icon: string }> = [
  { id: 'apartment', label: 'Apartamento', icon: '🏢' },
  { id: 'house', label: 'Casa', icon: '🏠' },
  { id: 'trip', label: 'Viagem', icon: '✈️' },
  { id: 'other', label: 'Outro', icon: '📋' },
]

export default function GroupSettings() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [currentUserId, setCurrentUserId] = useState<string>('')

  const [groupName, setGroupName] = useState('')
  const [category, setCategory] = useState<Category>('other')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [newParticipantName, setNewParticipantName] = useState('')
  const [newParticipantEmail, setNewParticipantEmail] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      setCurrentUserId(session.user.id)

      const { data, error } = await supabase
        .from('groups')
        .select('id,name,category,participants')
        .eq('id', groupId)
        .single()

      if (error || !data) {
        console.error('group.settings-load-error', error)
        router.replace(`/group/${groupId}`)
        return
      }

      setGroupName(data.name || '')
      setCategory((data.category || 'other') as Category)

      const loadedParticipants: Participant[] = Array.isArray(data.participants)
        ? data.participants
        : []

      setParticipants(loadedParticipants)
      setLoading(false)
    }

    load()
  }, [groupId, router])

  const addParticipant = () => {
    const name = newParticipantName.trim()
    const email = newParticipantEmail.trim()

    if (!name) return

    setParticipants((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        email: email || undefined,
      },
    ])

    setNewParticipantName('')
    setNewParticipantEmail('')
  }

  const removeParticipant = (id: string) => {
    if (id === currentUserId) return
    setParticipants((prev) => prev.filter((p) => p.id !== id))
  }

  const handleSave = async () => {
    const trimmedName = groupName.trim()

    if (!trimmedName || participants.length < 2) {
      alert('Adicione um nome e pelo menos 2 participantes')
      return
    }

    if (!participants.some((p) => p.id === currentUserId)) {
      alert('Voce precisa permanecer como participante do grupo')
      return
    }

    setSaving(true)

    const { data, error } = await supabase
      .from('groups')
      .update({
        name: trimmedName,
        category,
        participants,
      })
      .eq('id', groupId)
      .select('id')

    setSaving(false)

    if (error) {
      console.error('group.settings-save-error', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      alert('Erro ao salvar alteracoes')
      return
    }

    if (!data || data.length === 0) {
      console.error('group.settings-save-no-rows', {
        group_id: groupId,
        reason: 'update blocked by RLS or row not found',
      })
      alert('Sem permissao para salvar alteracoes do grupo (RLS)')
      return
    }

    router.push(`/group/${groupId}`)
  }

  const handleDeleteGroup = async () => {
    const confirmed = confirm('Tem certeza que deseja excluir este grupo? Esta acao nao pode ser desfeita.')
    if (!confirmed) return

    setDeleting(true)

    const { error: paymentsDeleteError } = await supabase.from('payments').delete().eq('group_id', groupId)
    if (paymentsDeleteError) {
      setDeleting(false)
      console.error('group.settings-delete-payments-error', {
        code: paymentsDeleteError.code,
        message: paymentsDeleteError.message,
        details: paymentsDeleteError.details,
        hint: paymentsDeleteError.hint,
      })
      alert('Erro ao excluir pagamentos do grupo')
      return
    }

    const { error: transactionsDeleteError } = await supabase.from('transactions').delete().eq('group_id', groupId)
    if (transactionsDeleteError) {
      setDeleting(false)
      console.error('group.settings-delete-transactions-error', {
        code: transactionsDeleteError.code,
        message: transactionsDeleteError.message,
        details: transactionsDeleteError.details,
        hint: transactionsDeleteError.hint,
      })
      alert('Erro ao excluir transacoes do grupo')
      return
    }

    const { data, error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId)
      .select('id')

    setDeleting(false)

    if (error) {
      console.error('group.settings-delete-error', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      alert('Erro ao excluir grupo')
      return
    }

    if (!data || data.length === 0) {
      console.error('group.settings-delete-no-rows', {
        group_id: groupId,
        reason: 'delete blocked by RLS or row not found',
      })
      alert('Sem permissao para excluir este grupo (RLS)')
      return
    }

    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href={`/group/${groupId}`}>
            <button className="text-gray-600 hover:text-gray-800" type="button">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">Editar grupo</h1>
          <button
            onClick={handleSave}
            className="text-[#5BC5A7] font-medium hover:text-[#4AB396]"
            disabled={saving}
            type="button"
          >
            {saving ? 'Salvando...' : 'Salvar'}
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
              <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{participant.name}</p>
                  {participant.email && <p className="text-xs text-gray-500">{participant.email}</p>}
                </div>
                {participant.id !== currentUserId && (
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

        <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-red-100">
          <h3 className="text-sm font-medium text-red-600 mb-3">Zona de perigo</h3>
          <button
            onClick={handleDeleteGroup}
            disabled={deleting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-60"
            type="button"
          >
            <Trash2 className="w-4 h-4" />
            <span className="font-medium">{deleting ? 'Excluindo...' : 'Excluir grupo'}</span>
          </button>
        </div>
      </main>
    </div>
  )
}
