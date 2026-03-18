'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
import { unstable_noStore as noStore } from 'next/cache'

type Salary = Database['public']['Tables']['salaries']['Row']
type SalaryAllocation = Database['public']['Tables']['salary_allocations']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']
type Goal = Database['public']['Tables']['goals']['Row']
type CustomCategory = Database['public']['Tables']['custom_categories']['Row']

export interface AppInitialData {
  transactions: Transaction[]
  goals: Goal[]
  salaries: Salary[]
  salaryAllocations: SalaryAllocation[]
  customCategories: CustomCategory[]
  systemConfig: Record<string, string>
}

import { ActionResult } from './actionUtils'

export type FetchAllResult = ActionResult<AppInitialData>

export async function fetchAllDataAction(pageSize: number = 50): Promise<FetchAllResult> {
  noStore()
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const client = supabase

    const [tRes, gRes, sRes, cRes, confRes] = await Promise.all([
      client.from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(pageSize),

      client.from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('deadline', { ascending: true }),

      client.from('salaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),

      client.from('custom_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),

      client.from('system_config')
        .select('key, value')
    ])

    if (tRes.error) throw new Error(`Transactions: ${tRes.error.message}`)
    if (gRes.error) throw new Error(`Goals: ${gRes.error.message}`)
    if (sRes.error) throw new Error(`Salaries: ${sRes.error.message}`)
    if (confRes.error) throw new Error(`Config: ${confRes.error.message}`)

    const systemConfig: Record<string, string> = {}
    if (confRes.data) {
      confRes.data.forEach((item: { key: string; value: string }) => {
        systemConfig[item.key] = item.value
      })
    }

    let salaryAllocations: SalaryAllocation[] = []
    if (sRes.data && sRes.data.length > 0) {
      const salaryIds = sRes.data.map(s => s.id)
      const { data: allocationsRes, error: allocError } = await client
        .from('salary_allocations')
        .select('*')
        .in('salary_id', salaryIds)
        .order('created_at', { ascending: true })

      if (allocError) throw new Error(`Allocations: ${allocError.message}`)
      salaryAllocations = allocationsRes as SalaryAllocation[] || []
    }

    return {
      success: true,
      data: {
        transactions: (tRes.data as Transaction[]) || [],
        goals: (gRes.data as Goal[]) || [],
        salaries: (sRes.data as Salary[]) || [],
        salaryAllocations,
        customCategories: (cRes.data as CustomCategory[]) || [],
        systemConfig
      }
    }
  } catch (err: unknown) {
    console.error('App data fetch failure:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Server error fetching app data' }
  }
}

