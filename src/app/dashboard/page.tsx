import { createServerSupabase } from '@/lib/db/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getDashboardDataAction } from '@/lib/actions/dashboard';
import { DashboardClient } from '@/components/features/dashboard/DashboardClient';

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
    profile = data;
  }

  const dashResult = user ? await getDashboardDataAction() : { data: null };
  const dashData = 'data' in dashResult ? dashResult.data : null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <PageContainer>
        <PageHeader
          title={`Welcome back, ${profile?.name?.split(' ')[0] || 'User'}`}
          description="Here's a summary of your financial status"
          action={
            <Link href="/transactions">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-brand-blue to-brand-accent text-white hover:brightness-110 shadow-lg shadow-brand-blue/20">
                <Plus className="h-4 w-4 mr-2" />
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
