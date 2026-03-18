import { Suspense } from 'react';
import { ShellLayout } from '@/components/layout/ShellLayout';
import { Toaster } from '@/components/ui/sonner';
import { SupabaseAuthProvider } from '@/providers/SupabaseAuthProvider';
import { SubscriptionProvider } from '@/providers/SubscriptionProvider';
import { CategoryProvider } from '@/providers/CategoryProvider';
import { SalaryProvider } from '@/providers/SalaryProvider';
import { GoalProvider } from '@/providers/GoalProvider';
import { TransactionProvider } from '@/providers/TransactionProvider';
import { getUsageStatsAction } from '@/features/saas/actions/usageActions';
import { createServerSupabase } from '@/lib/supabase/server';

export async function AppProviders({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user ? await supabase.from('users').select('*').eq('id', user.id).single() : { data: null };
  
  const usageResult = user ? await getUsageStatsAction() : { success: true, data: null };
  const initialUsage = usageResult.success && usageResult.data ? usageResult.data : {
    transactions: 0,
    goals: 0,
    salaries: 0,
    teamMembers: 1
  };

  return (
    <SupabaseAuthProvider
      initialUser={user}
      initialProfile={profile}
    >
      <SubscriptionProvider initialUsage={initialUsage}>
        <CategoryProvider>
          <SalaryProvider>
            <GoalProvider>
              <TransactionProvider>
                <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-background text-foreground">Loading...</div>}>
                  <ShellLayout>
                    {children}
                  </ShellLayout>
                </Suspense>
                <Toaster position="top-right" />
              </TransactionProvider>
            </GoalProvider>
          </SalaryProvider>
        </CategoryProvider>
      </SubscriptionProvider>
    </SupabaseAuthProvider>
  );
}
