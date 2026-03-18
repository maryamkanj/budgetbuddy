'use server'

import { createServerSupabase } from '@/lib/db/server'
import { Database } from '@/types/database'
import { PLAN_LIMITS } from '@/lib/config/plans'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'
import { getAuthenticatedUser, countAll, ActionResult } from '@/lib/actions/actionUtils'

type GoalInsert = Omit<Database['public']['Tables']['goals']['Insert'], 'user_id'>

export async function createGoalAction(data: GoalInsert): Promise<ActionResult<Database['public']['Tables']['goals']['Row']>> {
  noStore()
  const supabase = await createServerSupabase()
  const { user, tier } = await getAuthenticatedUser(supabase)

  if (!user || !tier) return { success: false, error: 'Not authenticated' }

  const limit = PLAN_LIMITS[tier].goals
  const used = await countAll(supabase, 'goals', user.id)

  if (used >= limit) {
    return {
      success: false,
      error: `You have reached the ${tier} plan limit of ${limit} goals. Please upgrade your plan.`
    }
  }

  const client = supabase
  const { data: created, error } = await client
    .from('goals')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/goals')
  return { success: true, data: created }
}

export async function updateGoalAction(id: string, data: Database['public']['Tables']['goals']['Update']): Promise<ActionResult<Database['public']['Tables']['goals']['Row']>> {
  noStore()
  const supabase = await createServerSupabase()
  const { user } = await getAuthenticatedUser(supabase)
  if (!user) return { success: false, error: 'Not authenticated' }

  const client = supabase
  const { data: updated, error } = await client
    .from('goals')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/goals')
  return { success: true, data: updated }
}

export async function deleteGoalAction(id: string): Promise<ActionResult<null>> {
  noStore()
  const supabase = await createServerSupabase()
  const { user } = await getAuthenticatedUser(supabase)
  if (!user) return { success: false, error: 'Not authenticated' }

  const client = supabase
  const { error } = await client
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/goals')
  return { success: true, data: null }
}

export async function refreshGoalsAction(): Promise<ActionResult<Database['public']['Tables']['goals']['Row'][]>> {
  noStore()
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('deadline', { ascending: true })

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (err: unknown) {
    console.error('Goals refresh fail:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Server error refreshing goals' }
  }
}

