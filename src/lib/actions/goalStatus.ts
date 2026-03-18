'use server'

import { createServerSupabase } from '@/lib/db/server'
import { Database } from '@/types/database'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'
import { getAuthenticatedUser, ActionResult } from '@/lib/actions/actionUtils'

/**
 * Updates goals that have passed their deadline to 'Overdue' status
 */
export async function updateOverdueGoalsAction(): Promise<ActionResult<{ updated: number }>> {
  noStore()
  try {
    const supabase = await createServerSupabase()
    const { user } = await getAuthenticatedUser(supabase)
    if (!user) return { success: false, error: 'Not authenticated' }

    const today = new Date().toISOString().split('T')[0]

    // Update goals that are past deadline and still marked as Active
    const { data, error } = await supabase
      .from('goals')
      .update({ status: 'Overdue' })
      .eq('user_id', user.id)
      .eq('status', 'Active')
      .lt('deadline', today)
      .select('id')

    if (error) throw error

    // Revalidate paths that might show goals
    revalidatePath('/')
    revalidatePath('/goals')
    revalidatePath('/dashboard')

    return { 
      success: true, 
      data: { updated: data?.length || 0 } 
    }
  } catch (err: unknown) {
    console.error('Error updating overdue goals:', err)
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to update overdue goals' 
    }
  }
}

/**
 * Updates a single goal's status based on current progress and deadline
 */
export async function updateGoalStatusAction(id: string): Promise<ActionResult<Database['public']['Tables']['goals']['Row']>> {
  noStore()
  try {
    const supabase = await createServerSupabase()
    const { user } = await getAuthenticatedUser(supabase)
    if (!user) return { success: false, error: 'Not authenticated' }

    // First get the current goal
    const { data: goal, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) throw fetchError
    if (!goal) throw new Error('Goal not found')

    // Determine the correct status
    let newStatus: 'Active' | 'Completed' | 'Failed' | 'Overdue' = 'Active'
    
    if (goal.current_amount >= goal.target_amount) {
      newStatus = 'Completed'
    } else if (goal.deadline && new Date(goal.deadline) < new Date()) {
      newStatus = 'Overdue'
    } else if (goal.status === 'Failed') {
      newStatus = 'Failed'
    }

    // Update the goal if status changed
    if (newStatus !== goal.status) {
      const { data: updatedGoal, error: updateError } = await supabase
        .from('goals')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Revalidate paths
      revalidatePath('/')
      revalidatePath('/goals')
      revalidatePath('/dashboard')

      return { success: true, data: updatedGoal }
    }

    return { success: true, data: goal }
  } catch (err: unknown) {
    console.error('Error updating goal status:', err)
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to update goal status' 
    }
  }
}
