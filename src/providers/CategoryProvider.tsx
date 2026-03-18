'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { useSupabaseAuth } from './SupabaseAuthProvider'
import {
    getCustomCategories,
    addCustomCategory as apiAddCustomCategory,
    deleteCustomCategory as apiDeleteCustomCategory
} from '@/lib/actions/categories'
import { CustomCategory } from '@/lib/actions/categoryConstants'

interface CategoryContextType {
    customCategories: CustomCategory[]
    refreshCustomCategories: () => Promise<void>
    addCustomCategory: (name: string, type?: 'expense' | 'saving' | 'allocation') => Promise<CustomCategory>
    deleteCustomCategory: (id: string) => Promise<void>
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export function CategoryProvider({
    children,
    initialCategories = []
}: {
    children: ReactNode,
    initialCategories?: CustomCategory[]
}) {
    const { userProfile, loading: authLoading } = useSupabaseAuth()
    const [customCategories, setCustomCategories] = useState<CustomCategory[]>(initialCategories)

    const refreshCustomCategories = useCallback(async () => {
        if (!userProfile) return
        try {
            const cc = await getCustomCategories()
            setCustomCategories(cc)
        } catch (err) {
            console.error('Error refreshing custom categories:', err)
        }
    }, [userProfile])

    // Simplified useEffect - no automatic fetching
    useEffect(() => {
        if (!userProfile && !authLoading) {
            setCustomCategories([])
        }
    }, [userProfile, authLoading])

    const addCustomCategory = useCallback(async (name: string, type: 'expense' | 'saving' | 'allocation' = 'allocation') => {
        if (!userProfile) throw new Error('User not authenticated')

        const tempId = 'temp-' + Date.now()
        const optimisticCategory: CustomCategory = {
            id: tempId,
            name,
            type,
            user_id: userProfile.id,
            created_at: new Date().toISOString()
        }

        setCustomCategories(prev => [optimisticCategory, ...prev])

        try {
            const result = await apiAddCustomCategory(name, type)
            if (!result.success) {
                setCustomCategories(prev => prev.filter(c => c.id !== tempId))
                throw new Error(result.error)
            }

            setCustomCategories(prev => prev.map(c => c.id === tempId ? result.data : c))
            return result.data
        } catch (err) {
            setCustomCategories(prev => prev.filter(c => c.id !== tempId))
            console.error('Error adding custom category:', err)
            throw err
        }
    }, [userProfile]);

    const deleteCustomCategory = useCallback(async (id: string) => {
        if (!userProfile) throw new Error('User not authenticated')

        const originalCategories = [...customCategories]
        setCustomCategories(prev => prev.filter(c => c.id !== id))

        try {
            const result = await apiDeleteCustomCategory(id)
            if (!result.success) {
                setCustomCategories(originalCategories)
                throw new Error(result.error)
            }
        } catch (err) {
            setCustomCategories(originalCategories)
            console.error('Error deleting custom category:', err)
            throw err
        }
    }, [userProfile, customCategories]);

    const value = useMemo(() => ({
        customCategories,
        refreshCustomCategories,
        addCustomCategory,
        deleteCustomCategory,
    }), [customCategories, refreshCustomCategories, addCustomCategory, deleteCustomCategory]);

    return (
        <CategoryContext.Provider value={value}>
            {children}
        </CategoryContext.Provider>
    )
}

export function useCategories() {
    const context = useContext(CategoryContext)
    if (context === undefined) {
        throw new Error('useCategories must be used within a CategoryProvider')
    }
    return context
}
