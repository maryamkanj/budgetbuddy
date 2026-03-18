'use client';

import { DollarSign, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import { Database } from '@/types/supabase';
import { StatCard } from '@/components/ui/statCard';
import { formatCurrency } from '@/lib/utils/financial';

type Salary = Database['public']['Tables']['salaries']['Row'];
type SalaryAllocation = Database['public']['Tables']['salary_allocations']['Row'];

interface SalarySummaryCardsProps {
  salaries: Salary[];
  salaryAllocations: SalaryAllocation[];
}

export function SalarySummaryCards({ 
  salaries, 
  salaryAllocations
}: SalarySummaryCardsProps) {
  const totalIncome = salaries.reduce((sum, s) => sum + (s.base_salary || 0), 0);
  const avgSalary = salaries.length > 0 ? totalIncome / salaries.length : 0;
  const mainCurrency = salaries[0]?.currency as 'USD' | 'LBP' || 'USD';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <StatCard
        title="Total Salaries"
        value={salaries.length}
        icon={DollarSign}
        iconColor="text-primary"
        iconBgColor="bg-primary/10"
      />
      
      <StatCard
        title="Total Income"
        value={formatCurrency(totalIncome, mainCurrency)}
        icon={TrendingUp}
        iconColor="text-accent"
        iconBgColor="bg-accent/10"
      />
      
      <StatCard
        title="Total Allocations"
        value={salaryAllocations.length}
        icon={PieChart}
        iconColor="text-[var(--chart-3)]"
        iconBgColor="bg-muted/10"
      />
      
      <StatCard
        title="Avg. Salary"
        value={formatCurrency(avgSalary, mainCurrency)}
        icon={BarChart3}
        iconColor="text-muted-foreground"
        iconBgColor="bg-muted/10"
      />
    </div>
  );
}
