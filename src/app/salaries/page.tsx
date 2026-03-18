import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { SalariesClient, AddSalaryButton } from '@/features/salary/components/SalariesClient';
import { MainSalariesList } from '@/features/salary/components/MainSalariesList';
import { refreshSalariesAction } from '@/features/salary/actions/salaryActions';

export default async function SalariesPage() {
  const result = await refreshSalariesAction();
  // Safe extraction of data
  const initialData = result.success ? result.data : null;
  const initialSalaries = initialData?.salaries || [];
  const initialAllocations = initialData?.salaryAllocations || [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <PageContainer>
        <SalariesClient 
          initialSalaries={initialSalaries} 
          initialAllocations={initialAllocations}
        >
          <PageHeader
            title="Salaries"
            description="Define your monthly income sources and strategically allocate percentages to categories for automatic budget tracking."
            action={<AddSalaryButton />}
          />
          <MainSalariesList />
        </SalariesClient>
      </PageContainer>
    </div>
  );
}
