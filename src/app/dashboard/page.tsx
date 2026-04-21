import { createServerSupabase } from '@/lib/db/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { PiggyBank, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getDashboardDataAction } from '@/lib/actions/dashboard';
import { DashboardClient } from '@/components/features/dashboard/DashboardClient';

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  
  const dashResult = user ? await getDashboardDataAction() : { data: null };
  const dashData = 'data' in dashResult ? dashResult.data : null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <PageContainer>
        <PageHeader
          title="Financial Dashboard"
          description="Here's a summary of your financial status"
          icon={PiggyBank}
          action={
            <Link href="/transactions">
              <Button className="w-full sm:w-auto bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white hover:translate-y-[-1px] active:translate-y-[0px] shadow-lg shadow-primary/20 transition-all duration-300 rounded-xl px-6 font-semibold">
                <Plus className="h-4 w-4 mr-2 stroke-[3px]" />
                Add Transaction
              </Button>
            </Link>
          }
        />

        <DashboardClient
          initialTransactions={dashData?.transactions}
          initialGoals={dashData?.goals}
          initialSalaries={dashData?.salaries}
          initialAllocations={dashData?.allocations}
        />
      </PageContainer>
    </div>
  );
}
