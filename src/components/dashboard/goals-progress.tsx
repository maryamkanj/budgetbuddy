'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Goal } from '@/types/goal';
import { Target, Calendar, DollarSign } from 'lucide-react';

interface GoalsProgressProps {
  goals: Goal[];
}

export function GoalsProgress({ goals }: GoalsProgressProps) {
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'LBP' ? 'USD' : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const activeGoals = goals.filter(goal => goal.status === 'Active');

  if (activeGoals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Financial Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No active goals. Set your first financial goal to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Financial Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeGoals.slice(0, 3).map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          return (
            <div key={goal.id} className="space-y-2 p-3 border rounded-lg">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-sm">{goal.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  daysLeft < 7 ? 'bg-red-100 text-red-800' :
                  daysLeft < 30 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {daysLeft}d left
                </span>
              </div>
              
              <Progress value={progress} className="h-2" />
              
              <div className="flex justify-between text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatAmount(goal.currentAmount, goal.targetCurrency)} / {formatAmount(goal.targetAmount, goal.targetCurrency)}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(goal.deadline)}
                </div>
              </div>
              
              <div className="text-right text-xs font-medium">
                {progress.toFixed(1)}%
              </div>
            </div>
          );
        })}
        
        {activeGoals.length > 3 && (
          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              +{activeGoals.length - 3} more goals
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}