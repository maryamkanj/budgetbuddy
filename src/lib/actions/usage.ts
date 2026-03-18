'use server'

import { createServerSupabase } from '@/lib/db/server'
import { unstable_noStore as noStore } from 'next/cache'

import { ActionResult } from '@/lib/actions/actionUtils'

export async function getUsageStatsAction(): Promise<ActionResult<{ transactions: number, goals: number, salaries: number, teamMembers: number }>> {
  noStore()
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [tCount, gCount, sCount] = await Promise.all([
      supabase.from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('date', startOfMonth),

      supabase.from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),

      supabase.from('salaries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
    ])

    return {
      success: true,
      data: {
        transactions: tCount.count || 0,
        goals: gCount.count || 0,
        salaries: sCount.count || 0,
        teamMembers: 1
      }
    }
  } catch (err: unknown) {
    console.error('Usage stats fetch fail:', err)
    return { success: false, error: 'Failed to fetch usage stats' }
  }
}
