'use server'

import { createServerSupabase } from '@/lib/db/server'
import { Database } from '@/types/database'
import { unstable_noStore as noStore } from 'next/cache'

import { ActionResult } from '@/lib/actions/actionUtils'

export async function getTransactionsAction(page: number = 0, pageSize: number = 50): Promise<ActionResult<{ data: Database['public']['Tables']['transactions']['Row'][] | null, hasMore: boolean }>> {
  noStore()
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const from = page * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(from, to)

    if (error) throw error

    return {
      success: true,
      data: {
        data,
        hasMore: (count || 0) > to + 1
      }
    }
  } catch (err: unknown) {
    console.error('Transactions fetch fail:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Server error' }
  }
}
