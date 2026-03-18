import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Target } from 'lucide-react';
import { GoalsClient, AddGoalButton } from './GoalsClient';
import { GoalsList } from './GoalsList';
import { refreshGoalsAction } from '@/features/goals/actions/goalActions';

export default async function GoalsPage() {
  const result = await refreshGoalsAction();
  const initialGoals = result.success ? result.data : [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <PageContainer>
        <GoalsClient>
          <PageHeader
            title="Financial Goals"
            description="Track and achieve your long-term financial targets."
            icon={Target}
            action={<AddGoalButton />}
          />
          <GoalsList initialGoals={initialGoals} />
        </GoalsClient>
      </PageContainer>
    </div>
  );
}
