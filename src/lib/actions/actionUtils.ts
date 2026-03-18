import { createServerSupabase } from '@/lib/db/server'
import { SubscriptionTier } from '@/lib/config/plans'

export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

export async function getAuthenticatedUser(supabase: Awaited<ReturnType<typeof createServerSupabase>>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { user: null, tier: null as SubscriptionTier | null }

  const client = supabase
  const { data: profile } = await client
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const tier: SubscriptionTier = profile?.subscription_tier ?? 'Free'
  return { user, tier }
}

export async function countAll(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  table: 'goals' | 'salaries',
  userId: string
): Promise<number> {
  const client = supabase
  const { count } = await client
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  return count ?? 0
}
