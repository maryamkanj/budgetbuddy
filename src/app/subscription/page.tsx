import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Crown } from 'lucide-react';
import { SubscriptionClient } from '@/components/features/subscription/SubscriptionClient';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <PageContainer>
        <PageHeader
          title="Subscription Management"
          description="Manage your BudgetBuddy subscription and choose the plan that works best for you."
          icon={Crown}
        />
        <SubscriptionClient />
      </PageContainer>
    </div>
  );
}
