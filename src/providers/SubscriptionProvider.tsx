'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';


import {
    SubscriptionTier,
    SubscriptionLimits,
    SubscriptionPlan,
    SUBSCRIPTION_PLANS
} from '@/lib/config/plans';

export type { SubscriptionTier, SubscriptionLimits, SubscriptionPlan };

export interface UsageData {
    transactions: number;
    goals: number;
    salaries: number;
    teamMembers: number;
}

export interface SubscriptionContextType {
    tier: SubscriptionTier;
    plan: SubscriptionPlan;
    usage: UsageData;
    isLoading: boolean;

    upgrade: (tier: SubscriptionTier) => Promise<void>;
    downgrade: (tier: SubscriptionTier) => Promise<void>;
    cancel: () => Promise<void>;
    trackUsage: (type: keyof UsageData, amount?: number, isTotal?: boolean) => void;
    getUsagePercentage: (type: keyof UsageData) => number;
    isNearLimit: (type: keyof UsageData) => boolean;
    isAtLimit: (type: keyof UsageData) => boolean;

    hasFeature: (feature: string) => boolean;
    canAccess: (requiredTier: SubscriptionTier) => boolean;
}

import { useSupabaseAuth } from '@/providers/SupabaseAuthProvider';

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({
    children,
    initialUsage
}: {
    children: ReactNode;
    initialUsage?: UsageData;
}) {
    const { userProfile, updateSubscription } = useSupabaseAuth();

    const [tier, setTier] = useState<SubscriptionTier>('Free');
    const [usage, setUsage] = useState<UsageData>(initialUsage || {
        transactions: 0,
        goals: 0,
        salaries: 0,
        teamMembers: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (userProfile?.subscription_tier) {
            setTier(userProfile.subscription_tier);
        }
    }, [userProfile]);

    const plan = SUBSCRIPTION_PLANS[tier];

    const upgrade = useCallback(async (newTier: SubscriptionTier) => {
        setIsSubmitting(true);
        try {
            const { error } = await updateSubscription(newTier);
            if (error) throw new Error(error);
            setTier(newTier);
        } catch (error) {
            console.error('Upgrade failed:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [updateSubscription]);

    const downgrade = useCallback(async (newTier: SubscriptionTier) => {
        setIsSubmitting(true);
        try {
            const { error } = await updateSubscription(newTier);
            if (error) throw new Error(error);
            setTier(newTier);
        } catch (error) {
            console.error('Downgrade failed:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [updateSubscription]);

    const cancel = useCallback(async () => {
        setIsSubmitting(true);
        try {
            const { error } = await updateSubscription('Free');
            if (error) throw new Error(error);
            setTier('Free');
        } catch (error) {
            console.error('Cancellation failed:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [updateSubscription]);

    const hasFeature = useCallback((feature: string): boolean => {
        return plan.features.includes(feature);
    }, [plan.features]);

    const canAccess = useCallback((requiredTier: SubscriptionTier): boolean => {
        const tierHierarchy = { 'Free': 0, 'Pro': 1, 'Business': 2 };
        return tierHierarchy[tier] >= tierHierarchy[requiredTier];
    }, [tier]);

    const trackUsage = useCallback((type: keyof UsageData, amount: number = 1, isTotal: boolean = false) => {
        setUsage(prev => ({
            ...prev,
            [type]: isTotal ? amount : prev[type] + amount
        }));
    }, []);

    const getUsagePercentage = useCallback((type: keyof UsageData): number => {
        const limit = plan.limits[type];
        if (limit >= 999999) return 0;
        return Math.min((usage[type] / limit) * 100, 100);
    }, [plan.limits, usage]);

    const isNearLimit = useCallback((type: keyof UsageData): boolean => {
        return getUsagePercentage(type) >= 80;
    }, [getUsagePercentage]);

    const isAtLimit = useCallback((type: keyof UsageData): boolean => {
        const limit = plan.limits[type];
        if (limit >= 999999) return false;
        return usage[type] >= limit;
    }, [plan.limits, usage]);

    const value: SubscriptionContextType = useMemo(() => ({
        tier,
        plan,
        usage,
        isLoading: isSubmitting,
        upgrade,
        downgrade,
        cancel,
        trackUsage,
        getUsagePercentage,
        isNearLimit,
        isAtLimit,
        hasFeature,
        canAccess
    }), [
        tier,
        plan,
        usage,
        isSubmitting,
        upgrade,
        downgrade,
        cancel,
        trackUsage,
        getUsagePercentage,
        isNearLimit,
        isAtLimit,
        hasFeature,
        canAccess
    ]);

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription(): SubscriptionContextType {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}

export function useFeatureAccess() {
    const { tier, hasFeature, canAccess } = useSubscription();

    return useMemo(() => ({
        hasAdvancedAnalytics: hasFeature('advanced_analytics'),
        hasDataExport: hasFeature('data_export'),
        hasTeamCollaboration: hasFeature('team_collaboration'),
        hasApiAccess: hasFeature('api_access'),
        hasCustomCategories: hasFeature('custom_categories'),
        canAccessPro: canAccess('Pro'),
        canAccessBusiness: canAccess('Business'),
        isFree: tier === 'Free',
        isPro: tier === 'Pro',
        isBusiness: tier === 'Business'
    }), [tier, hasFeature, canAccess]);
}

export function useUsageLimits() {
    const { plan, usage, getUsagePercentage, isNearLimit, isAtLimit } = useSubscription();

    return useMemo(() => ({
        transactions: {
            current: usage.transactions,
            limit: plan.limits.transactions,
            percentage: getUsagePercentage('transactions'),
            isNearLimit: isNearLimit('transactions'),
            isAtLimit: isAtLimit('transactions')
        },
        goals: {
            current: usage.goals,
            limit: plan.limits.goals,
            percentage: getUsagePercentage('goals'),
            isNearLimit: isNearLimit('goals'),
            isAtLimit: isAtLimit('goals')
        },
        salaries: {
            current: usage.salaries,
            limit: plan.limits.salaries,
            percentage: getUsagePercentage('salaries'),
            isNearLimit: isNearLimit('salaries'),
            isAtLimit: isAtLimit('salaries')
        },
        teamMembers: {
            current: usage.teamMembers,
            limit: plan.limits.teamMembers,
            percentage: getUsagePercentage('teamMembers'),
            isNearLimit: isNearLimit('teamMembers'),
            isAtLimit: isAtLimit('teamMembers')
        }
    }), [usage, plan.limits, getUsagePercentage, isNearLimit, isAtLimit]);
}
