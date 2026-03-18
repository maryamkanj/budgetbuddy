import { getReportsDataAction } from '@/features/reports/actions/reportActions';
import { ReportsClient } from '@/features/reports/components/ReportsClient';
import { Suspense } from 'react';
import { LoadingPage } from '@/components/ui/loadingSpinner';

interface PageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const { year: searchYear } = await searchParams;
  const currentYear = new Date().getFullYear().toString();
  const year = searchYear || currentYear;

  const result = await getReportsDataAction(year);

  if ('error' in result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingPage label="Loading reports..." />}>
      <ReportsClient 
        initialTransactions={result.data.transactions} 
        initialGoals={result.data.goals} 
        year={year}
      />
    </Suspense>
  );
}
