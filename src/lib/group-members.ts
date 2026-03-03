import { supabase } from '@/lib/supabase'

export type GroupMember = {
  id: string
  name: string
  avatarKey?: string
  isPremium?: boolean
}

export async function fetchGroupMembersMap(groupIds: string[], viewerUserId?: string | null) {
  const map = new Map<string, GroupMember[]>()
  if (groupIds.length === 0) return map

  const { data: participantRows, error: participantsError } = await supabase
    .from('participants')
    .select('group_id,user_id')
    .in('group_id', groupIds)

  if (participantsError) {
    throw participantsError
  }

  const pairs = ((participantRows as Array<{ group_id?: string; user_id?: string }> | null) ?? [])
    .map((row) => ({
      groupId: String(row.group_id || '').trim(),
      userId: String(row.user_id || '').trim(),
    }))
    .filter((row) => row.groupId && row.userId)

  const userIds = Array.from(new Set(pairs.map((row) => row.userId)))
  const profileMap = new Map<string, { username?: string; full_name?: string; privacy_profile_visible?: boolean; avatar_key?: string; is_premium?: boolean }>()

  if (userIds.length > 0) {
    let profileRows: Array<Record<string, unknown>> | null = null

    const preferred = await supabase
      .from('profiles')
      .select('id,username,full_name,privacy_profile_visible,avatar_key,is_premium')
      .in('id', userIds)

    if (preferred.error) {
      const fallback = await supabase
        .from('profiles')
        .select('id,username,full_name,is_premium')
        .in('id', userIds)

      if (fallback.error) {
        throw fallback.error
      }

      profileRows = (fallback.data as Array<Record<string, unknown>> | null) ?? null
    } else {
      profileRows = (preferred.data as Array<Record<string, unknown>> | null) ?? null
    }

    for (const row of profileRows ?? []) {
      const id = String((row as { id?: string }).id || '').trim()
      if (!id) continue
      profileMap.set(id, {
        username: String((row as { username?: string }).username || '').trim(),
        full_name: String((row as { full_name?: string }).full_name || '').trim(),
        privacy_profile_visible: Boolean((row as { privacy_profile_visible?: boolean }).privacy_profile_visible),
        avatar_key: String((row as { avatar_key?: string }).avatar_key || '').trim(),
        is_premium: Boolean((row as { is_premium?: boolean }).is_premium),
      })
    }
  }

  for (const groupId of groupIds) {
    map.set(groupId, [])
  }

  for (const pair of pairs) {
    const profile = profileMap.get(pair.userId)
    const isSelf = Boolean(viewerUserId && String(viewerUserId) === String(pair.userId))
    const visible = Boolean(profile?.privacy_profile_visible || isSelf)
    const name = visible ? (profile?.username || profile?.full_name || 'Usuario') : 'Participante'
    map.get(pair.groupId)?.push({
      id: pair.userId,
      name,
      avatarKey: visible ? (profile?.avatar_key || '') : '',
      isPremium: visible ? Boolean(profile?.is_premium) : false,
    })
  }

  return map
}

