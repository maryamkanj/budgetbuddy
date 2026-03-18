'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Trash2, Edit, PieChart } from 'lucide-react';
import { AllocationForm } from './AllocationForm';
import { AllocationDistribution } from './AllocationDistribution';
import { Database } from '@/types/database';
import { formatCurrency } from '@/lib/utils/financial';

type Salary = Database['public']['Tables']['salaries']['Row'];
type SalaryAllocation = Database['public']['Tables']['salary_allocations']['Row'];

interface SalaryOverviewProps {
  selectedSalary: Salary | null;
  allocations: SalaryAllocation[];
  onEditSalary: (salary: Salary) => void;
  onDeleteSalary: () => void;
  onAddAllocation: (allocation: { category: string; percentage: number }) => void;
}

export function SalaryOverview({
  selectedSalary,
  allocations,
  onEditSalary,
  onDeleteSalary,
  onAddAllocation
}: SalaryOverviewProps) {
  const [editingAllocationId, setEditingAllocationId] = useState<string | null>(null);
  const [editAllocationForm, setEditAllocationForm] = useState({ category: '', percentage: 0 });

  if (!selectedSalary) return null;

  const totalAllocatedPercentage = allocations.reduce((sum, alloc) => {
  const percentage = typeof alloc.percentage === 'string' ? parseFloat(alloc.percentage) : Number(alloc.percentage);
  return sum + (isNaN(percentage) ? 0 : percentage);
}, 0);
  
  console.log('SalaryOverview - All allocations:', allocations);
  console.log('SalaryOverview - Total Allocated Percentage:', totalAllocatedPercentage);

  const handleEditAllocation = (allocation: SalaryAllocation) => {
    setEditingAllocationId(allocation.id);
    setEditAllocationForm({
      category: allocation.category,
      percentage: allocation.percentage || 0
    });
  };

  const handleUpdateAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    // This would need to be implemented - for now just close editing
    setEditingAllocationId(null);
  };

  const handleDeleteAllocation = () => {
    // This would need to be implemented - for now just close editing
    setEditingAllocationId(null);
  };

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
              <div className="mt-3 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground">Active</span>
                </div>
                <div className="text-muted-foreground">
                  {allocations.length} allocation{allocations.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Allocation Form Container */}
              <Card className="border border-white/10 shadow-sm bg-card/70 backdrop-blur-md rounded-r-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Add Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 h-full">
                  <AllocationForm 
                    salary={selectedSalary} 
                    allocations={allocations} 
                    onAddAllocation={onAddAllocation}
                    compact={true}
                  />
                </CardContent>
              </Card>
              
              {/* Pie Chart Container */}
              <Card className="border border-white/10 shadow-sm bg-card/70 backdrop-blur-md rounded-l-none border-l-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Allocation Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 h-full">
                  <AllocationDistribution
                    selectedSalary={selectedSalary}
                    allocations={allocations}
                    editingAllocationId={editingAllocationId}
                    editAllocationForm={editAllocationForm}
                    setEditAllocationForm={setEditAllocationForm}
                    setEditingAllocationId={setEditingAllocationId}
                    handleEditAllocation={handleEditAllocation}
                    handleUpdateAllocation={handleUpdateAllocation}
                    handleDeleteAllocation={handleDeleteAllocation}
                  />
                </CardContent>
              </Card>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
