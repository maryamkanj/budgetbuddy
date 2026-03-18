'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSalaries } from '@/providers/SalaryProvider';
import { formatCurrency } from '@/lib/utils/financial';
import { Database } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Edit, Trash2, Plus, PieChart } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { DeleteConfirmModal } from '@/components/ui/deleteConfirmModal';

type Salary = Database['public']['Tables']['salaries']['Row'];
type SalaryAllocation = Database['public']['Tables']['salary_allocations']['Row'];

interface SalaryDetailsClientProps {
  initialSalary: Salary;
  initialAllocations: SalaryAllocation[];
}

export function SalaryDetailsClient({ initialSalary, initialAllocations }: SalaryDetailsClientProps) {
  const { deleteSalary } = useSalaries();
  const router = useRouter();

  const [salary] = useState<Salary>(initialSalary);
  const [allocations] = useState<SalaryAllocation[]>(initialAllocations);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteSalary(salary.id);
      toast.success('Salary deleted successfully');
      setShowDeleteModal(false);
      router.push('/salaries');
    } catch (error) {
      console.error('Error deleting salary:', error);
      toast.error('Failed to delete salary');
    }
  };

  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.allocated_amount, 0);
  const allocatedPercentage = salary.base_salary > 0 ? (totalAllocated / salary.base_salary) * 100 : 0;
  const remainingAmount = salary.base_salary - totalAllocated;
  const remainingPercentage = 100 - allocatedPercentage;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-3">
            <Link href="/salaries">
              <Button variant="outline" size="sm" className="mt-1 border-white/10 hover:bg-white/5">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold font-archivo text-foreground">
                {salary.salary_name || 'Salary Details'}
              </h1>
              <p className="text-muted-foreground mt-1">
                Created on {new Date(salary.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => router.push(`/salaries/edit/${salary.id}`)}
              className="flex-1 sm:flex-none"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteClick}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card className="border border-white/10 shadow-sm bg-card/70 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="bg-secondary-foreground/10 p-2 rounded-lg backdrop-blur-md">
                  <PieChart className="h-4 w-4 text-brand-blue" />
                </div>
                Salary Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Base Salary</p>
                <p className="text-2xl font-mono font-bold text-foreground">
                  {formatCurrency(salary.base_salary, salary.currency as 'USD' | 'LBP')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Currency</p>
                  <p className="text-lg font-medium text-foreground">{salary.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created On</p>
                  <p className="text-lg font-medium text-foreground">
                    {new Date(salary.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 shadow-sm bg-card/70 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="bg-secondary-foreground/10 p-2 rounded-lg backdrop-blur-md">
                  <PieChart className="h-4 w-4 text-brand-accent" />
                </div>
                Allocation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground font-medium">Allocated</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatCurrency(totalAllocated, salary.currency as 'USD' | 'LBP')}
                    <span className="text-muted-foreground ml-1">
                      ({allocatedPercentage.toFixed(1)}%)
                    </span>
                  </span>
                </div>
                <Progress value={allocatedPercentage} className="h-2 bg-white/10" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground font-medium">Remaining</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatCurrency(remainingAmount, salary.currency as 'USD' | 'LBP')}
                    <span className="text-muted-foreground ml-1">
                      ({remainingPercentage.toFixed(1)}%)
                    </span>
                  </span>
                </div>
                <Progress value={remainingPercentage} className="h-2 bg-brand-blue/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-white/10 shadow-sm bg-card/70 backdrop-blur-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl font-archivo">Allocations</CardTitle>
              <Button
                size="sm"
                onClick={() => router.push(`/salaries/${salary.id}/allocate`)}
                className="bg-gradient-to-r from-brand-blue to-brand-accent text-white hover:brightness-110 shadow-lg shadow-brand-blue/20 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Allocation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {allocations.length === 0 ? (
              <div className="text-center py-8 border border-white/10 border-dashed rounded-lg bg-brand-card/50">
                <PieChart className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
                <p className="text-muted-foreground mb-4 text-lg">No allocations yet</p>
                <Button
                  onClick={() => router.push(`/salaries/${salary.id}/allocate`)}
                  className="bg-gradient-to-r from-brand-blue to-brand-accent text-white hover:brightness-110"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Allocation
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {allocations.map((allocation) => (
                  <div
                    key={allocation.id}
                    className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{allocation.category}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {allocation.percentage}% of salary
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-brand-blue">
                        {formatCurrency(allocation.allocated_amount, salary.currency as 'USD' | 'LBP')}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {((allocation.allocated_amount / salary.base_salary) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Salary"
        description="Are you sure you want to delete this salary and all its allocations? This action cannot be undone."
        itemName={salary.salary_name || undefined}
      />
    </div>
  );
}
