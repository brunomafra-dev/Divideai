import { supabase } from '@/lib/supabase'

export type GroupQuota = {
  isPremium: boolean
  ownedGroups: number
  freeLimit: number
  canCreateGroup: boolean
}

const FREE_GROUP_LIMIT = 3

export async function fetchGroupQuota(userId: string): Promise<GroupQuota> {
  const [{ data: profile }, ownedGroupsResult] = await Promise.all([
    supabase.from('profiles').select('is_premium').eq('id', userId).maybeSingle(),
    supabase.from('groups').select('id', { count: 'exact', head: true }).eq('owner_id', userId),
  ])

  const isPremium = Boolean(profile?.is_premium)
  const ownedGroups = Number(ownedGroupsResult.count || 0)
  const canCreateGroup = isPremium || ownedGroups < FREE_GROUP_LIMIT

  return {
    isPremium,
    ownedGroups,
    freeLimit: FREE_GROUP_LIMIT,
    canCreateGroup,
  }
}
