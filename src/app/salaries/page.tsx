import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { SalariesClient, AddSalaryButton } from '@/components/features/salaries/SalariesClient';
import { MainSalariesList } from '@/components/features/salaries/MainSalariesList';
import { refreshSalariesAction } from '@/lib/actions/salaries';

// Opt out of static generation to allow dynamic data fetching
export const dynamic = 'force-dynamic'

export default async function SalariesPage() {
  let result;
  try {
    result = await refreshSalariesAction();
  } catch (error) {
    console.error('Failed to refresh salaries on page load:', error);
    result = { success: false, error: 'Failed to load salaries data' };
  }
  
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
