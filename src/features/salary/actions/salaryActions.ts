'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
import { PLAN_LIMITS } from '@/lib/config/plans'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'
import { getAuthenticatedUser, countAll, ActionResult } from '@/lib/actions/actionUtils'

type SalaryInsert = Omit<Database['public']['Tables']['salaries']['Insert'], 'user_id'>

export async function createSalaryAction(data: SalaryInsert): Promise<ActionResult<Database['public']['Tables']['salaries']['Row']>> {
  noStore()
  const supabase = await createServerSupabase()
  const { user, tier } = await getAuthenticatedUser(supabase)

  if (!user || !tier) return { success: false, error: 'Not authenticated' }

  const limit = PLAN_LIMITS[tier].salaries
  const used = await countAll(supabase, 'salaries', user.id)

  if (used >= limit) {
    return {
      success: false,
      error: `You have reached the ${tier} plan limit of ${limit} salaries. Please upgrade your plan.`
    }
  }

  const client = supabase
  const { data: created, error } = await (client
    .from('salaries')
    .insert({ ...data, user_id: user.id })
    .select()
    .single() as unknown as Promise<{ data: Database['public']['Tables']['salaries']['Row'] | null; error: { message: string } | null }>)

  if (error) return { success: false, error: error.message }
  if (!created) return { success: false, error: 'Failed to create salary' }
  revalidatePath('/')
  revalidatePath('/salaries')
  return { success: true, data: created }
}

export async function updateSalaryAction(id: string, data: Database['public']['Tables']['salaries']['Update']): Promise<ActionResult<Database['public']['Tables']['salaries']['Row']>> {
  noStore()
  const supabase = await createServerSupabase()
  const { user } = await getAuthenticatedUser(supabase)
  if (!user) return { success: false, error: 'Not authenticated' }

  const client = supabase
  const { data: updated, error } = await (client
    .from('salaries')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single() as unknown as Promise<{ data: Database['public']['Tables']['salaries']['Row'] | null; error: { message: string } | null }>)

  if (error) return { success: false, error: error.message }
  if (!updated) return { success: false, error: 'Failed to update salary' }
  revalidatePath('/')
  revalidatePath('/salaries')
  return { success: true, data: updated }
}

export async function deleteSalaryAction(id: string): Promise<ActionResult<null>> {
  noStore()
  const supabase = await createServerSupabase()
  const { user } = await getAuthenticatedUser(supabase)
  if (!user) return { success: false, error: 'Not authenticated' }

  const client = supabase

  const { error } = await (client
    .from('salaries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) as unknown as Promise<{ error: { message: string } | null }>)

  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/salaries')
  return { success: true, data: null }
}


export async function createSalaryAllocationAction(data: Database['public']['Tables']['salary_allocations']['Insert']): Promise<ActionResult<Database['public']['Tables']['salary_allocations']['Row']>> {
  noStore()
  const supabase = await createServerSupabase()
  const { user } = await getAuthenticatedUser(supabase)
  if (!user) return { success: false, error: 'Not authenticated' }

  const client = supabase
  const { data: salary } = await client
    .from('salaries')
    .select('id')
    .eq('id', data.salary_id)
    .eq('user_id', user.id)
    .single()

  if (!salary) return { success: false, error: 'Salary not found or access denied' }

  const { data: created, error } = await (client
    .from('salary_allocations')
    .insert(data)
    .select()
    .single() as unknown as Promise<{ data: Database['public']['Tables']['salary_allocations']['Row'] | null; error: { message: string } | null }>)

  if (error) return { success: false, error: error.message }
  if (!created) return { success: false, error: 'Failed to create allocation' }
  revalidatePath('/')
  revalidatePath('/salaries')
  return { success: true, data: created }
}

export async function updateSalaryAllocationAction(id: string, data: Database['public']['Tables']['salary_allocations']['Update']): Promise<ActionResult<Database['public']['Tables']['salary_allocations']['Row']>> {
  noStore()
  const supabase = await createServerSupabase()
  const { user } = await getAuthenticatedUser(supabase)
  if (!user) return { success: false, error: 'Not authenticated' }

  const client = supabase

  const { data: existing } = await (client
    .from('salary_allocations')
    .select('id, salaries!inner(user_id)')
    .eq('id', id)
    .eq('salaries.user_id', user.id)
    .single() as unknown as Promise<{ data: { id: string; salaries: { user_id: string } | { user_id: string }[] | null } | null; error: unknown }>)

  if (!existing) return { success: false, error: 'Allocation not found or access denied' }

  const { data: updated, error: updateError } = await (client
    .from('salary_allocations')
    .update(data)
    .eq('id', id)
    .select()
    .single() as unknown as Promise<{ data: Database['public']['Tables']['salary_allocations']['Row'] | null; error: { message: string } | null }>)

  if (updateError) return { success: false, error: updateError.message }
  if (!updated) return { success: false, error: 'Failed to update allocation' }
  revalidatePath('/')
  revalidatePath('/salaries')
  return { success: true, data: updated }
}

export async function deleteSalaryAllocationAction(id: string): Promise<ActionResult<null>> {
  noStore()
  const supabase = await createServerSupabase()
  const { user } = await getAuthenticatedUser(supabase)
  if (!user) return { success: false, error: 'Not authenticated' }

  const client = supabase

  const { data: existing } = await (client
    .from('salary_allocations')
    .select('id, salaries!inner(user_id)')
    .eq('id', id)
    .eq('salaries.user_id', user.id)
    .single() as unknown as Promise<{ data: { id: string; salaries: { user_id: string } | { user_id: string }[] | null } | null; error: unknown }>)

  if (!existing) return { success: false, error: 'Allocation not found or access denied' }

  const { error } = await (client
    .from('salary_allocations')
    .delete()
    .eq('id', id) as unknown as Promise<{ error: { message: string } | null }>)

  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/salaries')
  return { success: true, data: null }
}

export async function refreshSalariesAction(): Promise<ActionResult<{ salaries: Database['public']['Tables']['salaries']['Row'][]; salaryAllocations: Database['public']['Tables']['salary_allocations']['Row'][] }>> {
  noStore()
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    type Salary = Database['public']['Tables']['salaries']['Row']
    type SalaryAllocation = Database['public']['Tables']['salary_allocations']['Row']
    type SalaryWithAllocations = Salary & { salary_allocations: SalaryAllocation[] }

    const { data: queryData, error: queryError } = await (supabase
      .from('salaries')
      .select('*, salary_allocations(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) as unknown as Promise<{ data: SalaryWithAllocations[] | null; error: unknown }>)

    if (queryError) throw queryError

    const joinedData = queryData || []

    const salaries = joinedData.map((s) => {
      const rest = { ...s }
      // @ts-expect-error - salary_allocations is on the joined object but not the base Salary
      delete rest.salary_allocations
      return rest as Salary
    })
    const salaryAllocations = joinedData.flatMap((s) => s.salary_allocations || [])

    return {
      success: true,
      data: {
        salaries,
        salaryAllocations
      }
    }
  } catch (err: unknown) {
    console.error('Salaries refresh fail:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Server error refreshing salaries' }
  }
}

export async function getSalaryByIdAction(id: string): Promise<ActionResult<{ salary: Database['public']['Tables']['salaries']['Row']; allocations: Database['public']['Tables']['salary_allocations']['Row'][] }>> {
  noStore()
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }


    type Salary = Database['public']['Tables']['salaries']['Row']
    type SalaryAllocation = Database['public']['Tables']['salary_allocations']['Row']
    type SalaryWithAllocations = Salary & { salary_allocations: SalaryAllocation[] }

    const { data: queryData, error: queryError } = await (supabase
      .from('salaries')
      .select('*, salary_allocations(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single() as unknown as Promise<{ data: SalaryWithAllocations | null; error: unknown }>)

    if (queryError) throw queryError

    const salaryWithAllocations = queryData
    if (!salaryWithAllocations) return { success: false, error: 'Salary not found' }
    
    const { salary_allocations, ...salary } = salaryWithAllocations

    return {
      success: true,
      data: {
        salary,
        allocations: salary_allocations || []
      }
    }
  } catch (err: unknown) {
    console.error('Salary detail fetch fail:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Server error fetching salary' }
  }
}

