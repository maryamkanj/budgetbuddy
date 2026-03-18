'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { Database } from '@/types/supabase';
import { formatCurrency } from '@/lib/utils/financial';

type Salary = Database['public']['Tables']['salaries']['Row'];
type SalaryAllocation = Database['public']['Tables']['salary_allocations']['Row'];

interface SalaryDistributionCardProps {
  salaries: Salary[];
  salaryAllocations: SalaryAllocation[];
}

export function SalaryDistributionCard({ 
  salaries, 
  salaryAllocations
}: SalaryDistributionCardProps) {
  const totalIncome = salaries.reduce((sum, s) => sum + (s.base_salary || 0), 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Salary Distribution
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          Visual breakdown of your income sources
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {salaries.map((salary) => {
            const percentage = totalIncome > 0 ? ((salary.base_salary || 0) / totalIncome) * 100 : 0;
            const salaryAllocs = salaryAllocations.filter(sa => sa.salary_id === salary.id);
            const allocatedPercentage = salaryAllocs.reduce((sum, alloc) => sum + (alloc.percentage || 0), 0);
            
            return (
              <div key={salary.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {salary.salary_name || 'Unnamed Salary'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {salary.company_name && `${salary.company_name} • `}
                      {formatCurrency(salary.base_salary || 0, salary.currency as 'USD' | 'LBP')} • {percentage.toFixed(1)}% of total
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {allocatedPercentage.toFixed(1)}% allocated
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {salaryAllocs.length} categories
                    </p>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${allocatedPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
