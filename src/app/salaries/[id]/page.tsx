import { getSalaryByIdAction } from '@/features/salary/actions/salaryActions';
import { SalaryDetailsClient } from '@/features/salary/components/SalaryDetailsClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SalaryDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getSalaryByIdAction(id);
  if (!result.success) {
    if (result.error === 'Not authenticated') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <p className="text-muted-foreground">Please sign in to view this page.</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-brand-card p-4 rounded-full inline-flex mb-4">
            <Trash2 className="h-8 w-8 text-brand-muted" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Error</h1>
          <p className="text-muted-foreground mb-6">{result.error}</p>
          <Link href="/salaries">
            <Button className="bg-gradient-to-r from-brand-blue to-brand-accent text-white hover:brightness-110 shadow-lg shadow-brand-blue/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Salaries
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { salary, allocations } = result.data;

  if (!salary) {
    notFound();
  }

  return <SalaryDetailsClient initialSalary={salary} initialAllocations={allocations} />;
}