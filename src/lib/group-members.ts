import { supabase } from '@/lib/supabase'

export type GroupMember = {
  id: string
  name: string
}

export async function fetchGroupMembersMap(groupIds: string[]) {
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
  const profileMap = new Map<string, { username?: string; full_name?: string }>()

  if (userIds.length > 0) {
    const { data: profileRows, error: profilesError } = await supabase
      .from('profiles')
      .select('id,username,full_name')
      .in('id', userIds)

    if (profilesError) {
      throw profilesError
    }

    for (const row of profileRows ?? []) {
      const id = String((row as { id?: string }).id || '').trim()
      if (!id) continue
      profileMap.set(id, {
        username: String((row as { username?: string }).username || '').trim(),
        full_name: String((row as { full_name?: string }).full_name || '').trim(),
      })
    }
  }

  for (const groupId of groupIds) {
    map.set(groupId, [])
  }

  for (const pair of pairs) {
    const profile = profileMap.get(pair.userId)
    const name = profile?.username || profile?.full_name || 'Usuario'
    map.get(pair.groupId)?.push({
      id: pair.userId,
      name,
    })
  }

  return map
}

