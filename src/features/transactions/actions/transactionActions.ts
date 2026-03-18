'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
import { PLAN_LIMITS } from '@/lib/config/plans'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'
import { getAuthenticatedUser, ActionResult } from '@/lib/actions/actionUtils'

async function countCurrentMonth(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  table: 'transactions',
  userId: string
): Promise<number> {
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  const client = supabase
  const { count } = await client
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('date', start.toISOString().split('T')[0])

  return count ?? 0
}

type TransactionInsert = Omit<Database['public']['Tables']['transactions']['Insert'], 'user_id'>

export async function createTransactionAction(data: TransactionInsert): Promise<ActionResult<Database['public']['Tables']['transactions']['Row']>> {
  noStore()
  const supabase = await createServerSupabase()
  const { user, tier } = await getAuthenticatedUser(supabase)

  if (!user || !tier) return { success: false, error: 'Not authenticated' }

  const limit = PLAN_LIMITS[tier].transactions
  const used = await countCurrentMonth(supabase, 'transactions', user.id)

  if (used >= limit) {
    return {
      success: false,
      error: `You have reached the ${tier} plan limit of ${limit} transactions per month. Please upgrade your plan.`
    }
  }

  const client = supabase
  const { data: created, error } = await client
    .from('transactions')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/transactions')
  return { success: true, data: created }
}

export async function updateTransactionAction(id: string, data: Database['public']['Tables']['transactions']['Update']): Promise<ActionResult<Database['public']['Tables']['transactions']['Row']>> {
  noStore()
  const supabase = await createServerSupabase()
  const { user } = await getAuthenticatedUser(supabase)
  if (!user) return { success: false, error: 'Not authenticated' }

  const client = supabase
  const { data: updated, error } = await client
    .from('transactions')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/transactions')
  return { success: true, data: updated }
}

export async function deleteTransactionAction(id: string): Promise<ActionResult<null>> {
  noStore()
  const supabase = await createServerSupabase()
  const { user } = await getAuthenticatedUser(supabase)
  if (!user) return { success: false, error: 'Not authenticated' }

  const client = supabase
  const { error } = await client
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/')
  revalidatePath('/transactions')

  return { success: true, data: null }
}

export async function refreshTransactionsAction(page: number = 0, pageSize: number = 50): Promise<ActionResult<Database['public']['Tables']['transactions']['Row'][]>> {
  noStore()
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(page * pageSize, page * pageSize + pageSize - 1)

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (err: unknown) {
    console.error('Transactions refresh fail:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Server error refreshing transactions' }
  }
}

