import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Database } from 'lucide-react';
import { TransactionsClient, AddTransactionButton } from '@/components/features/transactions/TransactionsClient';
import { TransactionsList } from '@/components/features/transactions/TransactionsList';
import { getTransactionsAction } from '@/lib/actions/transactionFetchActions';

export default async function TransactionsPage() {
  const result = await getTransactionsAction(0, 50);
  const initialData = (result.success && result.data?.data) || [];
  const hasMoreInitial = (result.success && result.data?.hasMore) || false;

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <PageContainer>
        <TransactionsClient>
          <PageHeader
            title="Transactions"
            description="Analyze your financial movements, manage categories, and drill down into your spending habits with real-time tracking."
            icon={Database}
            action={<AddTransactionButton />}
          />
          <TransactionsList initialTransactions={initialData} initialHasMore={hasMoreInitial} />
        </TransactionsClient>
      </PageContainer>
    </div>
  );
}