'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Database } from '@/types/database';
import { PiggyBank, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';
import { useGoals } from '@/providers/GoalProvider';
import Link from 'next/link';
import { toast } from 'sonner';
import { useState } from 'react';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { formatCurrency } from '@/lib/utils/financial';
import { getGoalEffectiveStatus, getDaysRemaining, getDeadlineStatus, getGoalUrgency } from '@/lib/utils/goals';

type Goal = Database['public']['Tables']['goals']['Row'];

interface GoalsProgressProps {
  goals: Goal[];
  limit?: number;
}

export function GoalsProgress({ goals, limit = 3 }: GoalsProgressProps) {
  const { deleteGoal } = useGoals();
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);



  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const activeGoals = goals.filter(goal => getGoalEffectiveStatus(goal) === 'Active');

  if (activeGoals.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            Savings Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Setting your first goal is the first step to successful saving.
            </p>
            <Link href="/goals">
              <button className="text-sm text-primary hover:underline font-medium">
                Set First Goal
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-primary" />
          Savings Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeGoals.slice(0, limit).map((goal) => {
          const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
          const urgency = getGoalUrgency(goal);
          const daysRemaining = getDaysRemaining(goal);
          const deadlineStatus = getDeadlineStatus(goal);

          return (
            <div key={goal.id} className="space-y-3 p-3 sm:p-4 border border-white/5 rounded-2xl bg-card/40 hover:bg-card/60 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                <PiggyBank className="h-12 w-12 text-primary" />
              </div>
              <div className="flex justify-between items-start relative z-10">
                <h4 className="font-semibold text-sm truncate pr-2">{goal.title}</h4>
                <div className="flex items-center gap-2 shrink-0">
                  {daysRemaining !== null && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      urgency === 'critical' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                      urgency === 'high' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                      urgency === 'medium' ? 'bg-warning/10 text-warning border border-warning/20' :
                      'bg-muted/10 text-muted-foreground'
                    }`}>
                      {deadlineStatus}
                    </span>
                  )}
                  {!goal.id.startsWith('temp-') && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/goals?edit=${goal.id}`}>
                        <Edit className="h-3 w-3 text-muted-foreground hover:text-primary cursor-pointer" />
                      </Link>
                      <Trash2
                        className="h-3 w-3 text-muted-foreground hover:text-destructive cursor-pointer"
                        onClick={() => setGoalToDelete(goal.id)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Progress 
                value={progress} 
                className={`h-1.5 ${
                  urgency === 'critical' || urgency === 'high' ? 'bg-destructive/20' : 'bg-brand-success/20'
                }`} 
              />

              <div className="flex flex-col sm:flex-row justify-between gap-2 text-[10px] sm:text-[11px] text-muted-foreground pt-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <DollarSign className="h-3 w-3 text-primary shrink-0" />
                  <span className="font-mono truncate">{formatCurrency(goal.current_amount, goal.target_currency)} / {formatCurrency(goal.target_amount, goal.target_currency)}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Calendar className="h-3 w-3" />
                  <span className={daysRemaining !== null && daysRemaining < 0 ? 'text-destructive' : ''}>
                    {formatDate(goal.deadline)}
                  </span>
                </div>
              </div>

              <div className={`text-right text-[10px] font-bold uppercase tracking-tighter ${
                urgency === 'critical' || urgency === 'high' ? 'text-destructive' : 'text-brand-success'
              }`}>
                {progress.toFixed(1)}% ACHIEVED
              </div>
            </div>
          );
        })}

        {activeGoals.length > limit && (
          <div className="text-center pt-2">
            <Link href="/goals" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              +{activeGoals.length - limit} more goals • View All
            </Link>
          </div>
        )}
      </CardContent>
      <DeleteConfirmModal
        isOpen={!!goalToDelete}
        onClose={() => setGoalToDelete(null)}
        onConfirm={async () => {
          if (!goalToDelete) return;
          try {
            await deleteGoal(goalToDelete);
            toast.success('Goal deleted');
            setGoalToDelete(null);
          } catch (err) {
            console.error(err);
            toast.error('Failed to delete goal');
          }
        }}
        title="Delete Goal"
        description="Are you sure you want to delete this goal? This will remove all progress data."
      />
    </Card>
  );
}
