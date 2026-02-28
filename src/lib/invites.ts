import { supabase } from '@/lib/supabase'

const PENDING_INVITE_TOKEN_KEY = 'invite_token'

type InviteTokenRow = {
  id: string
  group_id: string
  token: string
  expires_at: string | null
}

function decodeBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function generateSecureInviteToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return decodeBase64Url(bytes)
}

export function savePendingInviteToken(token: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(PENDING_INVITE_TOKEN_KEY, token)
}

export function consumePendingInviteToken(): string | null {
  if (typeof window === 'undefined') return null
  const token = window.localStorage.getItem(PENDING_INVITE_TOKEN_KEY)
  if (token) {
    window.localStorage.removeItem(PENDING_INVITE_TOKEN_KEY)
  }
  return token
}

export function peekPendingInviteToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(PENDING_INVITE_TOKEN_KEY)
}

export function clearPendingInviteToken() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(PENDING_INVITE_TOKEN_KEY)
}

async function getInviteTokenRow(token: string): Promise<InviteTokenRow> {
  const { data, error } = await supabase
    .from('invite_tokens')
    .select('id,group_id,token,expires_at')
    .eq('token', token)
    .single()

  if (error || !data) {
    throw new Error('Convite invalido')
  }

  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    throw new Error('Convite expirado')
  }

  return data
}

export async function acceptInviteToken(token: string, userId: string): Promise<string> {
  const invite = await getInviteTokenRow(token)

  const { data: existingParticipant, error: existingParticipantError } = await supabase
    .from('participants')
    .select('id')
    .eq('group_id', invite.group_id)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingParticipantError) {
    throw existingParticipantError
  }

  if (existingParticipant) return invite.group_id

  try {
    const { error } = await supabase.from('participants').insert({
      group_id: invite.group_id,
      user_id: userId,
      role: 'member',
    })

    if (error) throw error
  } catch (error: any) {
    const code = String(error?.code || '')
    if (code !== '23505') {
      throw error
    }
  }

  return invite.group_id
}
