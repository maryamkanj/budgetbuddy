'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabaseClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import {
  changePasswordAction,
  updateProfileAction,
  deleteAccountAction,
  signInAction,
  signUpAction,
  signOutAction
} from '@/lib/actions/authActions'
import { LoadingSpinner } from '@/components/ui/loadingSpinner'

type AppUser = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  userProfile: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<AppUser>) => Promise<{ error?: string }>
  updateSubscription: (tier: 'Free' | 'Pro' | 'Business') => Promise<{ error?: string }>
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ error?: string }>
  deleteAccount: () => Promise<{ error?: string }>
  isLoggingOut: boolean
  systemConfig: Record<string, string>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({
  children,
  initialUser = null,
  initialProfile = null,
  initialSystemConfig = {}
}: {
  children: ReactNode,
  initialUser?: User | null,
  initialProfile?: AppUser | null,
  initialSystemConfig?: Record<string, string>
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [userProfile, setUserProfile] = useState<AppUser | null>(initialProfile)
  const [systemConfig] = useState<Record<string, string>>(initialSystemConfig)
  const [loading, setLoading] = useState(!initialProfile)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (initialProfile && loading) {
      setLoading(false)
    }

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          if (!userProfile) {
            await fetchUserProfile(session.user.id)
          }
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setUserProfile(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user)
        } else if (event === 'INITIAL_SESSION') {
          if (session?.user) {
            setUser(session.user)
            if (!userProfile) {
              await fetchUserProfile(session.user.id)
            }
          }
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [userProfile, initialProfile, loading])


  const fetchUserProfile = async (userId: string) => {
    try {
      const client = supabaseClient
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          const { data: userData } = await supabaseClient.auth.getUser()
          if (userData.user) {
            type UserInsert = Database['public']['Tables']['users']['Insert']
            const insertData: UserInsert = {
              id: userId,
              email: userData.user.email!,
              name: userData.user.user_metadata?.name || userData.user.email?.split('@')[0] || 'User',
            }

            const { data: newProfile, error: createError } = await client
              .from('users')
              .insert(insertData)
              .select()
              .single()

            if (createError) {
              console.error('Error creating user profile:', createError)
              setUserProfile(null)
            } else {
              setUserProfile(newProfile)
            }
          }
        } else {
          console.error('Error fetching user profile:', error)
          setUserProfile(null)
        }
      } else {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Exception fetching user profile:', error)
      setUserProfile(null)
    }
  }


  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await signInAction(email, password)
      if (!result.success) return { error: result.error }
      return {}
    } catch (err) {
      console.error('Sign in error:', err)
      return { error: 'Authentication service is temporarily unavailable' }
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      const result = await signUpAction(email, password, name)
      if (!result.success) return { error: result.error }
      return {}
    } catch (err) {
      console.error('Sign up error:', err)
      return { error: 'Registration service is temporarily unavailable' }
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setIsLoggingOut(true)
      await Promise.all([
        signOutAction(),
        supabaseClient.auth.signOut()
      ])

      sessionStorage.removeItem('bb_user_profile')

      window.location.href = '/login'
    } catch (err) {
      console.error('Sign out error:', err)
      window.location.href = '/login'
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<AppUser>) => {
    try {
      const result = await updateProfileAction(updates)
      if (!result.success) throw new Error(result.error)

      await refreshProfile()
      return {}
    } catch (err: unknown) {
      console.error('Error updating profile:', err)
      return { error: err instanceof Error ? err.message : 'Profile update failed' }
    }
  }, [refreshProfile]);

  const updateSubscription = useCallback(async (tier: 'Free' | 'Pro' | 'Business') => {
    return await updateProfile({ subscription_tier: tier })
  }, [updateProfile]);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    try {
      const result = await changePasswordAction(oldPassword, newPassword)
      if (!result.success) return { error: result.error }
      return { success: true }
    } catch (err: unknown) {
      console.error('Error changing password:', err)
      return { error: 'Failed to communicate with authentication service' }
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      const result = await deleteAccountAction()
      if (!result.success) throw new Error(result.error)

      await supabaseClient.auth.signOut()
      setUser(null)
      setUserProfile(null)
      window.location.href = '/login'

      return { success: true }
    } catch (err: unknown) {
      console.error('Error deleting account:', err)
      return { error: err instanceof Error ? err.message : 'Account deletion failed' }
    }
  }, []);

  const value = useMemo(() => ({
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile,
    updateSubscription,
    changePassword,
    deleteAccount,
    isLoggingOut,
    systemConfig
  }), [
    user,
    userProfile,
    loading,
    isLoggingOut,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile,
    updateSubscription,
    changePassword,
    deleteAccount,
    systemConfig
  ])



  return (
    <AuthContext.Provider value={value}>
      {isLoggingOut && (
        <div className="fixed inset-0 z-overlay flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-lg font-medium text-foreground">Logging out...</p>
          </div>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}
