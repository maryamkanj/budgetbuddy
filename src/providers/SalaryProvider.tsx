'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef, useMemo } from 'react'
import { useSupabaseAuth } from './SupabaseAuthProvider'
import { Database } from '@/types/database'
import { 
    refreshSalariesAction, 
    createSalaryAction, 
    updateSalaryAction, 
    deleteSalaryAction,
    createSalaryAllocationAction,
    updateSalaryAllocationAction,
    deleteSalaryAllocationAction
} from '@/lib/actions/salaries'

type Salary = Database['public']['Tables']['salaries']['Row']
type SalaryAllocation = Database['public']['Tables']['salary_allocations']['Row']

interface SalaryContextType {
    salaries: Salary[]
    salaryAllocations: SalaryAllocation[]
    loading: boolean
    refreshSalaries: () => Promise<void>
    createSalary: (data: Omit<Database['public']['Tables']['salaries']['Insert'], 'user_id'>) => Promise<Salary>
    updateSalary: (id: string, data: Database['public']['Tables']['salaries']['Update']) => Promise<Salary>
    deleteSalary: (id: string) => Promise<void>
    createSalaryAllocation: (data: Database['public']['Tables']['salary_allocations']['Insert']) => Promise<SalaryAllocation>
    updateSalaryAllocation: (id: string, data: Database['public']['Tables']['salary_allocations']['Update']) => Promise<SalaryAllocation>
    deleteSalaryAllocation: (id: string) => Promise<void>
    initializeSalaries: (salaries: Salary[], allocations: SalaryAllocation[]) => void
}

const SalaryContext = createContext<SalaryContextType | undefined>(undefined)

export function SalaryProvider({
    children,
    initialSalaries = [],
    initialAllocations = []
}: {
    children: ReactNode,
    initialSalaries?: Salary[],
    initialAllocations?: SalaryAllocation[]
}) {
    const { userProfile, loading: authLoading } = useSupabaseAuth()
    const [salaries, setSalaries] = useState<Salary[]>(initialSalaries)
    const [salaryAllocations, setSalaryAllocations] = useState<SalaryAllocation[]>(initialAllocations)
    const [loading, setLoading] = useState(false)
    const isRefreshing = useRef(false)

    const refreshSalaries = useCallback(async () => {
        if (!userProfile || isRefreshing.current) return
        isRefreshing.current = true

        try {
            const result = await refreshSalariesAction()
            if (result.success) {
                setSalaries(result.data.salaries)
                setSalaryAllocations(result.data.salaryAllocations)
            }
        } catch (err) {
            console.error('Error refreshing salaries:', err)
        } finally {
            setLoading(false)
            isRefreshing.current = false
        }
    }, [userProfile]);

    const createSalary = useCallback(async (salaryData: Omit<Database['public']['Tables']['salaries']['Insert'], 'user_id'>) => {
        const result = await createSalaryAction(salaryData);
        if (!result.success) throw new Error(result.error);
        setSalaries(prev => [result.data, ...prev]);
        return result.data;
    }, []);

    const updateSalary = useCallback(async (id: string, salaryData: Database['public']['Tables']['salaries']['Update']) => {
        const result = await updateSalaryAction(id, salaryData);
        if (!result.success) throw new Error(result.error);
        setSalaries(prev => prev.map(s => s.id === id ? result.data : s));
        return result.data;
    }, []);

    const deleteSalary = useCallback(async (id: string) => {
        const result = await deleteSalaryAction(id);
        if (!result.success) throw new Error(result.error);
        setSalaries(prev => prev.filter(s => s.id !== id));
        setSalaryAllocations(prev => prev.filter(a => a.salary_id !== id));
    }, []);

    const createSalaryAllocation = useCallback(async (data: Database['public']['Tables']['salary_allocations']['Insert']) => {
        const result = await createSalaryAllocationAction(data);
        if (!result.success) throw new Error(result.error);
        setSalaryAllocations(prev => [...prev, result.data]);
        return result.data;
    }, []);

    const updateSalaryAllocation = useCallback(async (id: string, data: Database['public']['Tables']['salary_allocations']['Update']) => {
        const result = await updateSalaryAllocationAction(id, data);
        if (!result.success) throw new Error(result.error);
        setSalaryAllocations(prev => prev.map(a => a.id === id ? result.data : a));
        return result.data;
    }, []);

    const deleteSalaryAllocation = useCallback(async (id: string) => {
        const result = await deleteSalaryAllocationAction(id);
        if (!result.success) throw new Error(result.error);
        setSalaryAllocations(prev => prev.filter(a => a.id !== id));
    }, []);

    const initializeSalaries = useCallback((initialData: Salary[], initialAllocations: SalaryAllocation[]) => {
        setSalaries(initialData)
        setSalaryAllocations(initialAllocations)
    }, [])

    useEffect(() => {
        if (!userProfile && !authLoading) {
            setSalaries([])
            setSalaryAllocations([])
            setLoading(false)
        }
    }, [userProfile, authLoading])

    const value = useMemo(() => ({
        salaries,
        salaryAllocations,
        loading,
        refreshSalaries,
        createSalary,
        updateSalary,
        deleteSalary,
        createSalaryAllocation,
        updateSalaryAllocation,
        deleteSalaryAllocation,
        initializeSalaries
    }), [salaries, salaryAllocations, loading, refreshSalaries, createSalary, updateSalary, deleteSalary, createSalaryAllocation, updateSalaryAllocation, deleteSalaryAllocation, initializeSalaries])

    return (
        <SalaryContext.Provider value={value}>
            {children}
        </SalaryContext.Provider>
    )
}

export function useSalaries() {
    const context = useContext(SalaryContext)
    if (context === undefined) {
        throw new Error('useSalaries must be used within a SalaryProvider')
    }
    return context
}
