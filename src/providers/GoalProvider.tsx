'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef, useMemo } from 'react'
import { useSupabaseAuth } from './SupabaseAuthProvider'
import { useSubscription } from './SubscriptionProvider'
import { Database } from '@/types/database'
import {
    createGoalAction, updateGoalAction, deleteGoalAction, refreshGoalsAction
} from '@/lib/actions/goals'
import { updateOverdueGoalsAction } from '@/lib/actions/goalStatus'


type Goal = Database['public']['Tables']['goals']['Row']

interface GoalContextType {
    goals: Goal[]
    loading: boolean
    refreshGoals: () => Promise<void>
    createGoal: (data: Omit<Database['public']['Tables']['goals']['Insert'], 'user_id'>) => Promise<Goal>
    updateGoal: (id: string, data: Database['public']['Tables']['goals']['Update']) => Promise<Goal | null>
    deleteGoal: (id: string) => Promise<void>
    initializeGoals: (goals: Goal[]) => void
}

const GoalContext = createContext<GoalContextType | undefined>(undefined)

export function GoalProvider({
    children,
    initialGoals = []
}: {
    children: ReactNode,
    initialGoals?: Goal[]
}) {
    const { userProfile, loading: authLoading } = useSupabaseAuth()
    const { trackUsage } = useSubscription()
    const [goals, setGoals] = useState<Goal[]>(initialGoals)
    const [loading, setLoading] = useState(false)

    const isRefreshing = useRef(false)

    const refreshGoals = useCallback(async () => {
        if (!userProfile?.id || isRefreshing.current) return
        isRefreshing.current = true

        try {
            const result = await refreshGoalsAction()
            if (!result.success) {
                if (result.error === 'Not authenticated') return
                throw new Error(result.error)
            }

            setGoals(result.data)
        } catch (err) {
            console.error('Error refreshing goals:', err)
        } finally {
            setLoading(false)
            isRefreshing.current = false
        }
    }, [userProfile?.id])

    // Simplified useEffect - no automatic fetching or background tracking
    useEffect(() => {
        if (!userProfile && !authLoading) {
            setGoals([])
            setLoading(false)
        }
    }, [userProfile, authLoading])

    // Check for overdue goals when goals are loaded
    useEffect(() => {
        if (goals.length > 0 && userProfile) {
            const checkOverdueGoals = async () => {
                try {
                    await updateOverdueGoalsAction()
                    // Refresh goals to get updated status
                    await refreshGoals()
                } catch (error) {
                    console.error('Error checking overdue goals:', error)
                }
            }
            
            checkOverdueGoals()
        }
    }, [goals.length, userProfile, refreshGoals]) // Only run when goals count changes or user profile loads

    const createGoal = useCallback(async (goalData: Omit<Database['public']['Tables']['goals']['Insert'], 'user_id'>) => {
        if (!userProfile) throw new Error('User not authenticated')

        type GoalInsert = Omit<Database['public']['Tables']['goals']['Insert'], 'user_id'>;
        const sanitizedData: GoalInsert = { ...goalData };
        delete sanitizedData.id;
        delete sanitizedData.updated_at;

        const tempId = 'temp-' + Date.now()
        const optimisticGoal = {
            ...sanitizedData,
            id: tempId,
            user_id: userProfile.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: goalData.status || 'Active'
        } as Goal

        setGoals((prev: Goal[]) => [optimisticGoal, ...prev])

        try {
            const result = await createGoalAction(sanitizedData)
            if (!result.success) {
                setGoals((prev: Goal[]) => prev.filter((g: Goal) => g.id !== tempId))
                throw new Error(result.error)
            }

            setGoals((prev: Goal[]) => prev.map((g: Goal) => g.id === tempId ? result.data : g))
            trackUsage('goals', 1);
            return result.data
        } catch (err) {
            setGoals((prev: Goal[]) => prev.filter((g: Goal) => g.id !== tempId))
            console.error('Error creating goal:', err)
            throw err
        }
    }, [userProfile, trackUsage]);

    const updateGoal = useCallback(async (id: string, goalData: Database['public']['Tables']['goals']['Update']) => {
        if (!userProfile) throw new Error('User not authenticated')
        if (id.startsWith('temp-')) {
            console.warn('Attempted to update an optimistic goal')
            return null
        }

        const originalGoals = [...goals]
        const sanitizedData: Database['public']['Tables']['goals']['Update'] & { id?: string, user_id?: string, updated_at?: string } = { ...goalData };
        delete sanitizedData.id;
        delete sanitizedData.user_id;
        delete sanitizedData.updated_at;
        setGoals((prev: Goal[]) => prev.map((g: Goal) => g.id === id ? { ...g, ...sanitizedData } as Goal : g))

        try {
            const result = await updateGoalAction(id, sanitizedData)
            if (!result.success) {
                setGoals(originalGoals)
                throw new Error(result.error)
            }

            setGoals((prev: Goal[]) => prev.map((g: Goal) => g.id === id ? result.data : g))
            return result.data
        } catch (err) {
            setGoals(originalGoals)
            console.error('Error updating goal:', err)
            throw err
        }
    }, [userProfile, goals]);

    const deleteGoal = useCallback(async (id: string) => {
        if (!userProfile) throw new Error('User not authenticated')
        if (id.startsWith('temp-')) {
            console.warn('Attempted to delete an optimistic goal')
            return
        }

        const originalGoals = [...goals]
        setGoals((prev: Goal[]) => prev.filter((g: Goal) => g.id !== id))

        try {
            const result = await deleteGoalAction(id)
            if (!result.success) {
                setGoals(originalGoals)
                throw new Error(result.error)
            }
            trackUsage('goals', -1);
        } catch (err) {
            setGoals(originalGoals)
            console.error('Error deleting goal:', err)
            throw err
        }
    }, [userProfile, goals, trackUsage]);

    const initializeGoals = useCallback((initialData: Goal[]) => {
        setGoals((prev: Goal[]) => {
            const optimistic = prev.filter((g: Goal) => g.id.startsWith('temp-'));
            return [...optimistic, ...initialData];
        })
    }, [])

    const value = useMemo(() => ({
        goals,
        loading,
        refreshGoals,
        createGoal,
        updateGoal,
        deleteGoal,
        initializeGoals
    }), [goals, loading, refreshGoals, createGoal, updateGoal, deleteGoal, initializeGoals])

    return (
        <GoalContext.Provider value={value}>
            {children}
        </GoalContext.Provider>
    )
}

export function useGoals() {
    const context = useContext(GoalContext)
    if (context === undefined) {
        throw new Error('useGoals must be used within a GoalProvider')
    }
    return context
}
