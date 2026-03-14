'use client'

import { ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/ui/bottom-nav'
import { fetchGroupMembersMap, type GroupMember } from '@/lib/group-members'
import UserAvatar from '@/components/user-avatar'
import { usePremium } from '@/hooks/use-premium'
import { useAuth } from '@/context/AuthContext'

type GroupRow = {
  id: string
  name: string
}

type TransactionRow = {
  id: string
  group_id: string
  value: number
  payer_id: string
  created_at: string
}

type PaymentRow = {
  id: string
  group_id: string
  from_user: string
  to_user: string
  amount: number
  created_at: string
}

type ActivityItem = {
  id: string
  type: 'expense' | 'settle'
  description: string
  groupName: string
  createdAt: string
  actorName: string
  actorAvatarKey?: string
  actorIsPremium?: boolean
}

type ActivityViewCache = {
  myId: string | null
  groups: GroupRow[]
  membersByGroup: Map<string, GroupMember[]>
  transactions: TransactionRow[]
  payments: PaymentRow[]
}

let activityViewCache: ActivityViewCache | null = null

function formatBRL(n: number) {
  return `R$ ${n.toFixed(2).replace('.', ',')}`
}

function timeAgo(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const sec = Math.floor(diffMs / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)

  if (sec < 60) return 'agora'
  if (min < 60) return `${min} min atras`
  if (hr < 24) return `${hr} horas atras`
  if (day === 1) return '1 dia atras'
  if (day < 30) return `${day} dias atras`
  return d.toLocaleDateString('pt-BR')
}

export default function Activity() {
  const router = useRouter()
  const { isPremium } = usePremium()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(() => !activityViewCache)
  const [myId, setMyId] = useState<string | null>(() => activityViewCache?.myId ?? null)
  const [groups, setGroups] = useState<GroupRow[]>(() => activityViewCache?.groups ?? [])
  const [membersByGroup, setMembersByGroup] = useState<Map<string, GroupMember[]>>(
    () => activityViewCache?.membersByGroup ?? new Map()
  )
  const [transactions, setTransactions] = useState<TransactionRow[]>(() => activityViewCache?.transactions ?? [])
  const [payments, setPayments] = useState<PaymentRow[]>(() => activityViewCache?.payments ?? [])
  const hasLoadedOnceRef = useRef(Boolean(activityViewCache))
  const runInFlightRef = useRef(false)
  const rerunRequestedRef = useRef(false)

  const run = useCallback(async (currentUserId: string, showBlockingLoading: boolean = false) => {
      if (runInFlightRef.current) {
        rerunRequestedRef.current = true
        return
      }
      runInFlightRef.current = true
      if (showBlockingLoading || !hasLoadedOnceRef.current) {
        setLoading(true)
      }
      try {
      setMyId(currentUserId)

      const [groupsResp, txResp, payResp] = await Promise.all([
        supabase.from('groups').select('id,name'),
        supabase
          .from('transactions')
          .select('id,group_id,value,payer_id,created_at')
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('payments')
          .select('id,group_id,from_user,to_user,amount,created_at')
          .order('created_at', { ascending: false })
          .limit(30),
      ])

      const safeGroups = ((groupsResp.data as GroupRow[] | null) ?? [])
      setGroups(safeGroups)

      try {
        const membersMap = await fetchGroupMembersMap(safeGroups.map((group) => group.id), currentUserId)
        setMembersByGroup(membersMap)
      } catch (error) {
        console.error('activity.members-load-error', error)
        setMembersByGroup(new Map())
      }

      setTransactions(
        (((txResp.data as TransactionRow[] | null) ?? []).map((x) => ({
          ...x,
          value: Number(x.value) || 0,
        })))
      )

      setPayments(
        (((payResp.data as PaymentRow[] | null) ?? []).map((x) => ({
          ...x,
          amount: Number(x.amount) || 0,
        })))
      )

      activityViewCache = {
        myId: currentUserId,
        groups: safeGroups,
        membersByGroup,
        transactions: (((txResp.data as TransactionRow[] | null) ?? []).map((x) => ({
          ...x,
          value: Number(x.value) || 0,
        }))),
        payments: (((payResp.data as PaymentRow[] | null) ?? []).map((x) => ({
          ...x,
          amount: Number(x.amount) || 0,
        }))),
      }
      } catch (error) {
        console.error('activity.load-unhandled-error', error)
      } finally {
      runInFlightRef.current = false
      hasLoadedOnceRef.current = true
      setLoading(false)
      if (rerunRequestedRef.current) {
        rerunRequestedRef.current = false
        void run(currentUserId, false)
      }
      }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user?.id) {
      router.replace('/login')
      return
    }

    void run(user.id, !activityViewCache)

    const channel = supabase
      .channel('activity-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        void run(user.id, false)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        void run(user.id, false)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => {
        void run(user.id, false)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => {
        void run(user.id, false)
      })
      .subscribe()

    const onFocus = () => void run(user.id, false)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void run(user.id, false)
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [authLoading, router, run, user?.id])

  const groupMap = useMemo(() => {
    const m = new Map<string, GroupRow>()
    groups.forEach((g) => m.set(g.id, g))
    return m
  }, [groups])

  const userNameFromGroup = (groupId: string, userId: string) => {
    const participants = membersByGroup.get(groupId) || []
    const found = participants.find((p) => String(p.id) === String(userId))
    return found?.name || null
  }

  const userAvatarFromGroup = (groupId: string, userId: string) => {
    const participants = membersByGroup.get(groupId) || []
    const found = participants.find((p) => String(p.id) === String(userId))
    return found?.avatarKey || ''
  }

  const userIsPremiumFromGroup = (groupId: string, userId: string) => {
    const participants = membersByGroup.get(groupId) || []
    const found = participants.find((p) => String(p.id) === String(userId))
    return Boolean(found?.isPremium)
  }

  const activities: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = []

    for (const tx of transactions) {
      const group = groupMap.get(tx.group_id)
      const groupName = group?.name || 'Grupo'
      const payerName =
        myId && String(tx.payer_id) === String(myId)
          ? 'Você'
          : userNameFromGroup(tx.group_id, tx.payer_id) || 'Alguem'

      items.push({
        id: `tx_${tx.id}`,
        type: 'expense',
        description: `${payerName} pagou ${formatBRL(tx.value)}`,
        groupName,
        createdAt: tx.created_at,
        actorName: payerName,
        actorAvatarKey: userAvatarFromGroup(tx.group_id, tx.payer_id),
        actorIsPremium: userIsPremiumFromGroup(tx.group_id, tx.payer_id),
      })
    }

    for (const pay of payments) {
      const group = groupMap.get(pay.group_id)
      const groupName = group?.name || 'Grupo'
      const fromName =
        myId && String(pay.from_user) === String(myId)
          ? 'Você'
          : userNameFromGroup(pay.group_id, pay.from_user) || 'Alguem'
      const toName =
        myId && String(pay.to_user) === String(myId)
          ? 'Você'
          : userNameFromGroup(pay.group_id, pay.to_user) || 'alguem'

      items.push({
        id: `pay_${pay.id}`,
        type: 'settle',
        description: `${fromName} pagou ${toName} ${formatBRL(pay.amount)}`,
        groupName,
        createdAt: pay.created_at,
        actorName: fromName,
        actorAvatarKey: userAvatarFromGroup(pay.group_id, pay.from_user),
        actorIsPremium: userIsPremiumFromGroup(pay.group_id, pay.from_user),
      })
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return items.slice(0, 30)
  }, [transactions, payments, groupMap, membersByGroup, myId])

  if (loading && activities.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-gray-600 text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col overflow-x-hidden page-fade">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <button className="tap-target pressable text-gray-600 hover:text-gray-800" aria-label="Voltar" type="button">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="section-title">Atividade</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-4 py-6 pb-[calc(8rem+env(safe-area-inset-bottom))]">
        {activities.length === 0 ? (
          <div className="surface-card p-6 text-center">
            <p className="text-gray-700 font-medium">Sem atividades por enquanto</p>
            <p className="text-sm text-gray-500 mt-1">
              Quando alguem adicionar gastos ou pagamentos, eles aparecem aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="surface-card p-4 surface-card-hover"
              >
                <div className="flex items-start gap-3">
                  <UserAvatar name={activity.actorName} avatarKey={activity.actorAvatarKey} isPremium={activity.actorIsPremium} className="w-10 h-10 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{activity.groupName}</p>
                    <p className="text-xs text-gray-500 mt-1">{timeAgo(activity.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {!isPremium && (
        <div className="max-w-4xl w-full mx-auto px-4 py-4">
          <div className="bg-gray-100 rounded-xl p-4 text-center border-2 border-dashed border-gray-300">
            <p className="text-xs text-gray-500">Espaco reservado para anuncio</p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}


