'use server'

import { createServerSupabase } from '@/lib/db/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { ActionResult } from './actionUtils'
import { AuthTokenResponse, AuthResponse } from '@supabase/supabase-js'

export async function changePasswordAction(oldPassword: string, newPassword: string): Promise<ActionResult<null>> {
  try {
    const supabase = await createServerSupabase()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    const user = userData?.user

    if (userError || !user || !user.email) {
      return { success: false, error: 'Unauthorized: No active session found' }
    }

    const verifyClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          storageKey: 'bb-verify-server-only'
        }
      }
    )

    const { error: verifyError } = await verifyClient.auth.signInWithPassword({
      email: user.email,
      password: oldPassword.trim(),
    })

    if (verifyError) {
      return { success: false, error: 'Incorrect current password provided' }
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return { success: true, data: null }
  } catch (err: unknown) {
    console.error('Password change critical failure:', err)
    return { success: false, error: 'A server error occurred during password change' }
  }
}

export async function updateProfileAction(updates: Database['public']['Tables']['users']['Update']): Promise<ActionResult<null>> {
  try {
    const supabase = await createServerSupabase()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const user = userData?.user

    if (userError || !user) return { success: false, error: userError?.message || 'Not authenticated' }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (error) return { success: false, error: error.message }
    return { success: true, data: null }
  } catch (err: unknown) {
    console.error('Profile update failed:', err)
    return { success: false, error: 'Server error during profile update' }
  }
}

export async function deleteAccountAction(): Promise<ActionResult<null>> {
  try {
    const supabase = await createServerSupabase()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const user = userData?.user

    if (userError || !user) return { success: false, error: userError?.message || 'Not authenticated' }

    const { error: dbError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id)

    if (dbError) return { success: false, error: dbError.message }

    await supabase.auth.signOut()

    return { success: true, data: null }
  } catch (err: unknown) {
    console.error('Account deletion failed:', err)
    return { success: false, error: 'Server error during account deletion' }
  }
}

export async function signInAction(email: string, password: string): Promise<ActionResult<AuthTokenResponse['data']>> {
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) return { success: false, error: error.message }
    return { success: true, data }
  } catch (err: unknown) {
    console.error('Sign in failed:', err)
    return { success: false, error: 'Server error during sign in' }
  }
}

export async function signUpAction(email: string, password: string, name: string): Promise<ActionResult<AuthResponse['data']>> {
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })

    if (error) return { success: false, error: error.message }

    return { success: true, data }
  } catch (err: unknown) {
    console.error('Sign up failed:', err)
    return { success: false, error: 'Server error during sign up' }
  }
}


export async function signOutAction(): Promise<ActionResult<null>> {
  try {
    const supabase = await createServerSupabase()
    await supabase.auth.signOut()
    return { success: true, data: null }
  } catch (err: unknown) {
    console.error('Sign out failed:', err)
    return { success: false, error: 'Server error during sign out' }
  }
}
