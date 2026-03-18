'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Trash2, Edit, PieChart } from 'lucide-react';
import { AllocationForm } from './AllocationForm';
import { Database } from '@/types/supabase';
import { formatCurrency } from '@/lib/utils/financial';

type Salary = Database['public']['Tables']['salaries']['Row'];
type SalaryAllocation = Database['public']['Tables']['salary_allocations']['Row'];

interface SalaryOverviewProps {
  selectedSalary: Salary | null;
  allocations: SalaryAllocation[];
  onEditSalary: (salary: Salary) => void;
  onDeleteSalary: () => void;
  onAddAllocation: (allocation: Omit<SalaryAllocation, 'id' | 'created_at' | 'salary_id' | 'allocated_amount' | 'user_id'>) => void;
}

export function SalaryOverview({
  selectedSalary,
  allocations,
  onEditSalary,
  onDeleteSalary,
  onAddAllocation
}: SalaryOverviewProps) {
  if (!selectedSalary) return null;

  const totalAllocatedPercentage = allocations.reduce((sum, alloc) => sum + (alloc.percentage || 0), 0);
  const remainingPercentage = Math.max(0, 100 - totalAllocatedPercentage);

  return (
    <Card className="border border-white/10 shadow-sm bg-card/70 backdrop-blur-md">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              {selectedSalary.salary_name || 'Salary Details'}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {selectedSalary.company_name && `${selectedSalary.company_name} • `}
              Manage your allocations
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteSalary}
              className="text-muted-foreground hover:text-muted-foreground hover:bg-card"
              title="Delete salary"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditSalary(selectedSalary)}
              title="Edit salary"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex flex-col items-center text-center">
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(selectedSalary.base_salary || 0, selectedSalary.currency as 'USD' | 'LBP')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Monthly salary • {selectedSalary.currency}
              </p>
              <div className="mt-3 w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Allocated</span>
                  <span className="font-medium">{(100 - remainingPercentage).toFixed(1)}%</span>
                </div>
                <Progress value={100 - remainingPercentage} className="h-2" />
              </div>
            </div>
          </div>

          {allocations.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-border rounded-lg bg-secondary/50">
              <PieChart className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <h3 className="font-semibold text-foreground mb-1">No allocations yet</h3>
              <p className="text-sm text-muted-foreground mb-3">Add your first allocation to get started</p>
              <AllocationForm 
                salary={selectedSalary} 
                allocations={allocations} 
                onAddAllocation={onAddAllocation}
                compact={false}
              />
            </div>
          ) : (
            <AllocationForm 
              salary={selectedSalary} 
              allocations={allocations} 
              onAddAllocation={onAddAllocation}
              compact={true}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
