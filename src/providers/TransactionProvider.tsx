'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef, useMemo } from 'react'
import { useSupabaseAuth } from './SupabaseAuthProvider'
import { useSubscription } from './SubscriptionProvider'
import { Database } from '@/types/supabase'
import {
    createTransactionAction, updateTransactionAction, deleteTransactionAction, refreshTransactionsAction
} from '@/features/transactions/actions/transactionActions'


type Transaction = Database['public']['Tables']['transactions']['Row']

interface TransactionContextType {
    transactions: Transaction[]
    loading: boolean
    hasMoreTransactions: boolean
    isFetchingMore: boolean
    refreshTransactions: () => Promise<void>
    fetchMoreTransactions: () => Promise<void>
    createTransaction: (data: Omit<Database['public']['Tables']['transactions']['Insert'], 'user_id'>) => Promise<Transaction>
    updateTransaction: (id: string, data: Database['public']['Tables']['transactions']['Update']) => Promise<Transaction | null>
    deleteTransaction: (id: string) => Promise<void>
    initializeTransactions: (transactions: Transaction[], hasMore: boolean) => void
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({
    children,
    initialTransactions = []
}: {
    children: ReactNode,
    initialTransactions?: Transaction[]
}) {
    const { userProfile, loading: authLoading } = useSupabaseAuth()
    const { trackUsage } = useSubscription()
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
    const [loading, setLoading] = useState(false)

    const PAGE_SIZE = 50
    const [transactionsPage, setTransactionsPage] = useState(0)
    const [hasMoreTransactions, setHasMoreTransactions] = useState(false)
    const [isFetchingMore, setIsFetchingMore] = useState(false)

    const isRefreshing = useRef(false)

    const refreshTransactions = useCallback(async () => {
        if (!userProfile?.id || isRefreshing.current) return
        isRefreshing.current = true

        try {
            const result = await refreshTransactionsAction(0, PAGE_SIZE)
            if (!result.success) {
                if (result.error === 'Not authenticated') return
                throw new Error(result.error)
            }

            const data = result.data
            setTransactions(data)
            setHasMoreTransactions(data.length === PAGE_SIZE)
            setTransactionsPage(0)
        } catch (err) {
            console.error('Error refreshing transactions:', err)
        } finally {
            setLoading(false)
            isRefreshing.current = false
        }
    }, [userProfile]);

    // Simplified useEffect - no more automatic fetching or background tracking
    useEffect(() => {
        if (!userProfile && !authLoading) {
            setTransactions([])
            setLoading(false)
            setHasMoreTransactions(false)
            setTransactionsPage(0)
        }
    }, [userProfile, authLoading])

    const fetchMoreTransactions = useCallback(async () => {
        if (!userProfile || isFetchingMore || !hasMoreTransactions) return

        setIsFetchingMore(true)
        const nextPage = transactionsPage + 1
        try {
            const result = await refreshTransactionsAction(nextPage, PAGE_SIZE)
            if (!result.success) {
                if (result.error === 'Not authenticated') return
                throw new Error(result.error)
            }

            const data = result.data
            setTransactions(prev => [...prev, ...data])
            setHasMoreTransactions(data.length === PAGE_SIZE)
            setTransactionsPage(nextPage)
        } catch (err) {
            console.error('Error fetching more transactions:', err)
        } finally {
            setIsFetchingMore(false)
        }
    }, [userProfile, isFetchingMore, hasMoreTransactions, transactionsPage]);

    const createTransaction = useCallback(async (transactionData: Omit<Database['public']['Tables']['transactions']['Insert'], 'user_id'>) => {
        if (!userProfile) throw new Error('User not authenticated')
        type TransactionInsert = Omit<Database['public']['Tables']['transactions']['Insert'], 'user_id'>;
        const sanitizedData: TransactionInsert = { ...transactionData };
        delete sanitizedData.id;
        delete sanitizedData.updated_at;

        const tempId = 'temp-' + Date.now()
        const optimisticTransaction = {
            ...sanitizedData,
            id: tempId,
            user_id: userProfile.id,
            created_at: new Date().toISOString(),
        } as Transaction

        setTransactions((prev: Transaction[]) => [optimisticTransaction, ...prev])

        try {
            const result = await createTransactionAction(sanitizedData)
            if (!result.success) {
                setTransactions((prev: Transaction[]) => prev.filter((t: Transaction) => t.id !== tempId))
                throw new Error(result.error)
            }
            trackUsage('transactions', 1);
            setTransactions((prev: Transaction[]) => prev.map((t: Transaction) => t.id === tempId ? result.data : t))
            return result.data
        } catch (err) {
            setTransactions((prev: Transaction[]) => prev.filter((t: Transaction) => t.id !== tempId))
            console.error('Error creating transaction:', err)
            throw err
        }
    }, [userProfile, trackUsage]);

    const updateTransaction = useCallback(async (id: string, transactionData: Database['public']['Tables']['transactions']['Update']) => {
        if (!userProfile) throw new Error('User not authenticated')
        if (id.startsWith('temp-')) {
            console.warn('Attempted to update an optimistic transaction')
            return null
        }

        const originalTransactions = [...transactions]
        const sanitizedData: Database['public']['Tables']['transactions']['Update'] & { id?: string, user_id?: string, updated_at?: string } = { ...transactionData };
        delete sanitizedData.id;
        delete sanitizedData.user_id;
        delete sanitizedData.updated_at;
        setTransactions((prev: Transaction[]) => prev.map((t: Transaction) => t.id === id ? { ...t, ...sanitizedData } as Transaction : t))

        try {
            const result = await updateTransactionAction(id, sanitizedData)
            if (!result.success) {
                setTransactions(originalTransactions)
                throw new Error(result.error)
            }

            setTransactions((prev: Transaction[]) => prev.map((t: Transaction) => t.id === id ? result.data : t))
            return result.data
        } catch (err) {
            setTransactions(originalTransactions)
            console.error('Error updating transaction:', err)
            throw err
        }
    }, [userProfile, transactions]);

    const deleteTransaction = useCallback(async (id: string) => {
        if (!userProfile) throw new Error('User not authenticated')
        if (id.startsWith('temp-')) {
            console.warn('Attempted to delete an optimistic transaction')
            return
        }

        const originalTransactions = [...transactions]
        setTransactions((prev: Transaction[]) => prev.filter((t: Transaction) => t.id !== id))

        try {
            const result = await deleteTransactionAction(id)
            if (!result.success) {
                setTransactions(originalTransactions)
                throw new Error(result.error)
            }
            trackUsage('transactions', -1);
        } catch (err) {
            setTransactions(originalTransactions)
            console.error('Error deleting transaction:', err)
            throw err
        }
    }, [userProfile, transactions, trackUsage]);

    const initializeTransactions = useCallback((initialData: Transaction[], hasMore: boolean) => {
        setTransactions((prev: Transaction[]) => {
            const optimistic = prev.filter((t: Transaction) => t.id.startsWith('temp-'));
            // Merge optimistic with fresh initial data
            // We prepend optimistic items to the fresh data
            return [...optimistic, ...initialData];
        })
        setHasMoreTransactions(hasMore)
        setTransactionsPage(0)
    }, [])

    const value = useMemo(() => ({
        transactions,
        loading,
        hasMoreTransactions,
        isFetchingMore,
        refreshTransactions,
        fetchMoreTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        initializeTransactions
    }), [
        transactions,
        loading,
        hasMoreTransactions,
        isFetchingMore,
        refreshTransactions,
        fetchMoreTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        initializeTransactions
    ])

    return (
        <TransactionContext.Provider value={value}>
            {children}
        </TransactionContext.Provider>
    )
}

export function useTransactions() {
    const context = useContext(TransactionContext)
    if (context === undefined) {
        throw new Error('useTransactions must be used within a TransactionProvider')
    }
    return context
}
