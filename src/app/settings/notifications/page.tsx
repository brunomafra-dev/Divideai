'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/ui/bottom-nav'

export default function NotificationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [expenseAlerts, setExpenseAlerts] = useState(true)
  const [paymentAlerts, setPaymentAlerts] = useState(true)
  const [inviteAlerts, setInviteAlerts] = useState(true)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('notifications_expense,notifications_payment,notifications_invite')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setExpenseAlerts(Boolean(data.notifications_expense))
        setPaymentAlerts(Boolean(data.notifications_payment))
        setInviteAlerts(Boolean(data.notifications_invite))
      }

      setLoading(false)
    }

    load()
  }, [router])

  const updateSetting = async (column: 'notifications_expense' | 'notifications_payment' | 'notifications_invite', value: boolean) => {
    setSaving(column)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.replace('/login')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ [column]: value })
      .eq('id', user.id)

    if (error) {
      console.error('settings.notifications.update-error', error)
      if (column === 'notifications_expense') setExpenseAlerts(!value)
      if (column === 'notifications_payment') setPaymentAlerts(!value)
      if (column === 'notifications_invite') setInviteAlerts(!value)
    }

    setSaving(null)
  }

  const rows: Array<{
    label: string
    value: boolean
    column: 'notifications_expense' | 'notifications_payment' | 'notifications_invite'
    setLocal: (next: boolean) => void
  }> = [
    {
      label: 'Novo gasto no grupo',
      value: expenseAlerts,
      column: 'notifications_expense',
      setLocal: setExpenseAlerts,
    },
    {
      label: 'Pagamento marcado como recebido',
      value: paymentAlerts,
      column: 'notifications_payment',
      setLocal: setPaymentAlerts,
    },
    {
      label: 'Novo convite de grupo',
      value: inviteAlerts,
      column: 'notifications_invite',
      setLocal: setInviteAlerts,
    },
  ]

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-[calc(6rem+env(safe-area-inset-bottom))] page-fade">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/settings">
            <button type="button" className="tap-target pressable text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="section-title">Notificacoes</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-3">
        {loading ? (
          <div className="surface-card p-4 text-sm text-gray-600">Carregando...</div>
        ) : (
          rows.map((row) => (
            <div key={row.column} className="surface-card p-4 flex items-center justify-between">
              <span className="text-sm text-gray-800">{row.label}</span>
              <button
                type="button"
                disabled={saving === row.column}
                onClick={() => {
                  const next = !row.value
                  row.setLocal(next)
                  updateSetting(row.column, next)
                }}
                className={`tap-target pressable w-12 h-7 rounded-full p-1 transition ${row.value ? 'bg-[#5BC5A7]' : 'bg-gray-300'} disabled:opacity-50`}
              >
                <span className={`block w-5 h-5 rounded-full bg-white transition ${row.value ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  )
}
