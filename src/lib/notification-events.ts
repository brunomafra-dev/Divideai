import type { SupabaseClient } from '@supabase/supabase-js'

export type NotificationEventType = 'expense_created' | 'payment_received' | 'invite_received'

type NotificationPreferenceMap = Record<NotificationEventType, keyof NotificationPreferences>

type NotificationPreferences = {
  notifications_expense: boolean
  notifications_payment: boolean
  notifications_invite: boolean
}

export type NotificationEventInput = {
  recipientUserId: string
  actorUserId?: string | null
  groupId?: string | null
  type: NotificationEventType
  title: string
  body: string
  payload?: Record<string, unknown>
}

const preferenceByType: NotificationPreferenceMap = {
  expense_created: 'notifications_expense',
  payment_received: 'notifications_payment',
  invite_received: 'notifications_invite',
}

export async function queueNotificationEvent(
  supabase: SupabaseClient,
  input: NotificationEventInput
) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('notifications_expense,notifications_payment,notifications_invite')
    .eq('id', input.recipientUserId)
    .maybeSingle()

  if (profileError) return { queued: false as const, reason: 'profile_lookup_failed' as const }
  if (!profile) return { queued: false as const, reason: 'profile_not_found' as const }

  const preferenceKey = preferenceByType[input.type]
  if (!Boolean((profile as NotificationPreferences)[preferenceKey])) {
    return { queued: false as const, reason: 'preference_disabled' as const }
  }

  const { error } = await supabase.from('notifications').insert({
    user_id: input.recipientUserId,
    actor_id: input.actorUserId || null,
    group_id: input.groupId || null,
    type: input.type,
    title: input.title,
    body: input.body,
    payload: input.payload || {},
  })

  if (error) return { queued: false as const, reason: 'insert_failed' as const }
  return { queued: true as const }
}
