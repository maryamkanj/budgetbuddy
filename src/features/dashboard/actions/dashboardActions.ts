'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
import { unstable_noStore as noStore } from 'next/cache'

export async function getDashboardDataAction() {
  noStore()
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const client = supabase

    const [tRes, gRes, sRes] = await Promise.all([
      client.from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10),

      client.from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('deadline', { ascending: true }),

      client.from('salaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    ])

    if (tRes.error) throw tRes.error
    if (gRes.error) throw gRes.error
    if (sRes.error) throw sRes.error

    const salaries = sRes.data
    let allocations: Database['public']['Tables']['salary_allocations']['Row'][] = []

    if (salaries.length > 0) {
      const salaryIds = salaries.map(s => s.id)
      const { data: aRes, error: aErr } = await client
        .from('salary_allocations')
        .select('*')
        .in('salary_id', salaryIds)

      if (aErr) throw aErr
      allocations = aRes
    }

    return {
      data: {
        transactions: tRes.data,
        goals: gRes.data,
        salaries,
        allocations
      }
    }
  } catch (err: unknown) {
    console.error('Dashboard fetch fail:', err)
    return { error: err instanceof Error ? err.message : 'Server error' }
  }
}
