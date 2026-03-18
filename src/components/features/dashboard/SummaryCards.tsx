'use client';

import { TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';
import { FinancialNumber } from '@/components/common/FinancialNumber';
import { StatCard } from '@/components/common/StatCard';

interface SummaryCardsProps {
  totalSpending: number;
  totalSaving: number;
  netAmount: number;
  currency: string;
  activeGoals: number;
}

export function SummaryCards({
  totalSpending,
  totalSaving,
  netAmount,
  currency,
  activeGoals
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <StatCard
        title="Total Spending"
        value={<FinancialNumber amount={-Math.abs(totalSpending)} currency={currency} showSign={false} />}
        icon={TrendingDown}
        iconColor="text-destructive"
        iconBgColor="bg-destructive/10"
        description="THIS MONTH"
      />

      <StatCard
        title="Total Saving"
        value={<FinancialNumber amount={totalSaving} currency={currency} />}
        icon={TrendingUp}
        iconColor="text-primary"
        iconBgColor="bg-primary/10"
        description="THIS MONTH"
      />

      <StatCard
        title="Net Amount"
        value={<FinancialNumber amount={netAmount} currency={currency} />}
        icon={DollarSign}
        iconColor="text-accent"
        iconBgColor="bg-accent/10"
        trend={{
          value: netAmount >= 0 ? 'SAVED' : 'OVERSPENT',
          isPositive: netAmount >= 0,
          label: 'Net Difference'
        }}
      />

      <StatCard
        title="Active Goals"
        value={activeGoals}
        icon={Target}
        iconColor="text-accent"
        iconBgColor="bg-accent/10"
        description="IN PROGRESS"
      />
    </div>
  );
}