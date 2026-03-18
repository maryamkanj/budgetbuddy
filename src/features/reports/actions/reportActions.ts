'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'

export async function getReportsDataAction(year: string) {
  noStore()
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const startOfYear = `${year}-01-01`;
    const endOfYear = `${year}-12-31`;

    const [tRes, gRes] = await Promise.all([
      supabase.from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startOfYear)
        .lte('date', endOfYear)
        .order('date', { ascending: false }),

      supabase.from('goals')
        .select('*')
        .eq('user_id', user.id)
    ])

    if (tRes.error) throw tRes.error
    if (gRes.error) throw gRes.error

    return {
      data: {
        transactions: tRes.data || [],
        goals: gRes.data || []
      }
    }
  } catch (err: unknown) {
    console.error('Reports fetch fail:', err)
    return { error: 'Failed to fetch report data' }
  }
}
