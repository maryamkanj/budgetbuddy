'use server'

import { createServerSupabase } from '@/lib/db/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getAuthenticatedUser } from '@/lib/actions/actionUtils'
import { Database } from '@/types/database'

import { ActionResult } from '@/lib/actions/actionUtils'

export async function refreshSalariesAction(): Promise<ActionResult<{ salaries: Database['public']['Tables']['salaries']['Row'][], salaryAllocations: Database['public']['Tables']['salary_allocations']['Row'][] }>> {
  noStore()
  try {
    const supabase = await createServerSupabase()
    const { user } = await getAuthenticatedUser(supabase)
    if (!user) return { success: false, error: 'Not authenticated' }

    const [sRes, aRes] = await Promise.all([
      supabase.from('salaries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('salary_allocations').select('*').in('salary_id',
        (await supabase.from('salaries').select('id').eq('user_id', user.id)).data?.map(s => s.id) || []
      )
    ])

    if (sRes.error) throw sRes.error
    if (aRes.error) throw aRes.error

    return {
      success: true,
      data: {
        salaries: sRes.data || [],
        salaryAllocations: aRes.data || []
      }
    }
  } catch (err: unknown) {
    console.error('Salaries refresh fail:', err)
    return { success: false, error: 'Failed to refresh salaries' }
  }
}
