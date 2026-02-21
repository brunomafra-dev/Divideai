'use client'

import { ArrowLeft, Plus, TrendingUp, TrendingDown, Settings } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Participant {
  id: string
  name: string
  email?: string
}

interface TransactionRow {
  id: string
  description: string
  value: number
  payer_id: string
  participants?: string[]
  splits?: Record<string, number>
  created_at?: string
}

interface PaymentRow {
  from_user: string
  to_user: string
  amount: number
}

interface GroupRow {
  id: string
  name: string
  category: string
  participants?: Participant[]
}

interface Group {
  id: string
  name: string
  category: string
  totalSpent: number
  balance: number
  participants: number
  participantsList: Participant[]
  transactions: Array<{
    id: string
    description: string
    amount: number
    payerId: string
    payerName: string
    date: string
    participants: string[]
  }>
}

export default function GroupPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)

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

      const { data: groupRow, error: groupError } = await supabase
        .from('groups')
        .select('id,name,category,participants')
        .eq('id', groupId)
        .single()

      if (groupError || !groupRow) {
        console.error('group.load-error', groupError)
        router.replace('/')
        return
      }

      const participantsList: Participant[] = Array.isArray(groupRow.participants)
        ? groupRow.participants
        : []

      const { data: txRows, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })

      if (txError) {
        console.error('group.transactions-load-error', txError)
      }

      const { data: payRows, error: payError } = await supabase
        .from('payments')
        .select('from_user,to_user,amount')
        .eq('group_id', groupId)

      if (payError) {
        console.error('group.payments-load-error', payError)
      }

      const safeTx: TransactionRow[] = ((txRows as TransactionRow[] | null) ?? []).map((tx) => ({
        ...tx,
        value: Number(tx.value) || 0,
        participants: participantsList.map((p) => p.id),
      }))

      const userId = session.user.id
      const totalSpent = safeTx.reduce((sum, tx) => sum + tx.value, 0)
      const safePayments: PaymentRow[] = ((payRows as PaymentRow[] | null) ?? []).map((p) => ({
        ...p,
        amount: Number(p.amount) || 0,
      }))

      let paidByMe = 0
      let myShare = 0

      for (const tx of safeTx) {
        if (tx.payer_id === userId) paidByMe += tx.value
        if (tx.participants && tx.participants.length > 0 && tx.participants.includes(userId)) {
          myShare += tx.value / tx.participants.length
        }
      }

      let balance = paidByMe - myShare
      for (const pay of safePayments) {
        if (pay.from_user === userId) balance -= pay.amount
        if (pay.to_user === userId) balance += pay.amount
      }

      const transactions = safeTx.map((tx) => {
        const payer = participantsList.find((p) => p.id === tx.payer_id)
        return {
          id: tx.id,
          description: tx.description,
          amount: tx.value,
          payerId: tx.payer_id,
          payerName: tx.payer_id === userId ? 'Voce' : payer?.name || 'Alguem',
          date: tx.created_at || new Date().toISOString(),
          participants: tx.participants || [],
        }
      })

      setGroup({
        id: groupRow.id,
        name: groupRow.name,
        category: groupRow.category,
        totalSpent,
        balance,
        participants: participantsList.length,
        participantsList,
        transactions,
      })

      setLoading(false)
    }

    load()
  }, [groupId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <p className="text-gray-600">Grupo nao encontrado</p>
      </div>
    )
  }

  const amountPerPerson = group.participants > 0 ? group.totalSpent / group.participants : 0

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-20">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <button className="text-gray-600 hover:text-gray-800" type="button">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">{group.name}</h1>
          <Link href={`/group/${groupId}/settings`}>
            <button className="text-gray-600 hover:text-gray-800" type="button">
              <Settings className="w-6 h-6" />
            </button>
          </Link>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total gasto</p>
              <p className="text-2xl font-bold text-gray-800">R$ {group.totalSpent.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Seu saldo</p>
              {group.balance === 0 ? (
                <div className="flex items-center justify-center gap-2">
                  <p className="text-2xl font-bold text-gray-800">R$ 0,00</p>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">zerado</span>
                </div>
              ) : group.balance > 0 ? (
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#5BC5A7]" />
                  <p className="text-2xl font-bold text-[#5BC5A7]">R$ {group.balance.toFixed(2)}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <TrendingDown className="w-5 h-5 text-[#FF6B6B]" />
                  <p className="text-2xl font-bold text-[#FF6B6B]">R$ {Math.abs(group.balance).toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {group.totalSpent > 0 && (
        <div className="bg-[#5BC5A7]/10 border-b border-[#5BC5A7]/20">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-1">Cada pessoa fica com:</p>
              <p className="text-2xl font-bold text-[#5BC5A7]">R$ {amountPerPerson.toFixed(2)}</p>
              <p className="text-xs text-gray-600 mt-1">
                Total dividido por {group.participants} {group.participants === 1 ? 'pessoa' : 'pessoas'}
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-6">
        {group.transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhum gasto ainda</h3>
            <p className="text-gray-600 mb-6">Adicione o primeiro gasto do grupo</p>
            <Link href={`/group/${groupId}/add-expense`}>
              <button className="bg-[#5BC5A7] text-white px-6 py-3 rounded-lg hover:bg-[#4AB396] transition-colors" type="button">
                Adicionar gasto
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Gastos</h2>
              <span className="text-sm text-gray-600">{group.transactions.length} {group.transactions.length === 1 ? 'gasto' : 'gastos'}</span>
            </div>
            <div className="space-y-3">
              {group.transactions.map((transaction) => {
                const transactionParticipants = group.participantsList.filter((p) => transaction.participants.includes(p.id))
                const displayParticipants = transactionParticipants.slice(0, 3)
                const remainingCount = transactionParticipants.length - 3

                return (
                  <Link key={transaction.id} href={`/group/${groupId}/edit-expense/${transaction.id}`}>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-gray-800 mb-1">{transaction.description}</h3>
                          <p className="text-sm text-gray-600">{transaction.payerName} pagou</p>
                          <div className="flex items-center gap-1 mt-2">
                            {displayParticipants.map((participant, index) => (
                              <div
                                key={participant.id}
                                className="w-6 h-6 bg-[#5BC5A7] rounded-full flex items-center justify-center text-white text-xs font-medium"
                                style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                              >
                                {participant.name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {remainingCount > 0 && (
                              <div
                                className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-xs font-medium"
                                style={{ marginLeft: '-8px' }}
                              >
                                +{remainingCount}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-lg font-semibold text-gray-800">R$ {transaction.amount.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                        <span>{transaction.participants.length} {transaction.participants.length === 1 ? 'pessoa' : 'pessoas'}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </main>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-gray-100 rounded-xl p-4 text-center border-2 border-dashed border-gray-300">
          <p className="text-xs text-gray-500">Espaco reservado para anuncio</p>
        </div>
      </div>

      <Link href={`/group/${groupId}/add-expense`}>
        <button className="fixed bottom-20 right-6 w-16 h-16 bg-[#5BC5A7] rounded-full flex items-center justify-center shadow-lg hover:bg-[#4AB396] transition-all hover:scale-110" type="button">
          <Plus className="w-8 h-8 text-white" />
        </button>
      </Link>
    </div>
  )
}
