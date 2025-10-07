'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { localStorageService } from '@/lib/localStorage';
import { formatCurrency } from '@/lib/currency-utils';
import { Salary, SalaryAllocation } from '@/types/salary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function SalaryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [salary, setSalary] = useState<Salary | null>(null);
  const [allocations, setAllocations] = useState<SalaryAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    loadSalaryData(params.id as string);
  }, [params.id, router]);

  const loadSalaryData = (salaryId: string) => {
    try {
      const salaries = localStorageService.getSalaries();
      const salaryData = salaries.find(s => s.id === salaryId);
      
      if (!salaryData) {
        setError('Salary not found');
        setLoading(false);
        return;
      }

      const salaryAllocations = localStorageService.getAllocationsBySalaryId(salaryId);
      
      setSalary(salaryData);
      setAllocations(salaryAllocations);
    } catch (error) {
      console.error('Error loading salary data:', error);
      setError('Failed to load salary data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!salary) return;
    
    if (window.confirm('Are you sure you want to delete this salary? This action cannot be undone.')) {
      try {
        localStorageService.deleteSalary(salary.id);
        router.push('/salaries');
      } catch (error) {
        console.error('Error deleting salary:', error);
        setError('Failed to delete salary');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900">Loading salary details...</h1>
        </div>
      </div>
    );
  }

  if (error || !salary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Salary not found'}</p>
          <Link href="/salaries">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Salaries
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);
  const allocatedPercentage = salary.baseSalary > 0 ? (totalAllocated / salary.baseSalary) * 100 : 0;
  const remainingAmount = salary.baseSalary - totalAllocated;
  const remainingPercentage = 100 - allocatedPercentage;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/salaries">
                <Button variant="ghost" size="icon" className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {salary.name || 'Salary Details'}
              </h1>
            </div>
            <p className="text-gray-600 mt-1 ml-12">
              {new Date(salary.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/salaries/edit/${salary.id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Salary Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Salary Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Base Salary</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(salary.baseSalary, salary.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Currency</p>
                <p className="text-lg font-medium">{salary.currency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created On</p>
                <p className="text-lg font-medium">
                  {new Date(salary.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Allocation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Allocated</span>
                  <span className="font-medium">
                    {formatCurrency(totalAllocated, salary.currency)}
                    <span className="text-gray-500 ml-1">
                      ({allocatedPercentage.toFixed(1)}%)
                    </span>
                  </span>
                </div>
                <Progress value={allocatedPercentage} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-medium">
                    {formatCurrency(remainingAmount, salary.currency)}
                    <span className="text-gray-500 ml-1">
                      ({remainingPercentage.toFixed(1)}%)
                    </span>
                  </span>
                </div>
                <Progress value={remainingPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Allocations */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Allocations</CardTitle>
              <Button size="sm" onClick={() => router.push(`/salaries/${salary.id}/allocate`)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Allocation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {allocations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No allocations yet</p>
                <Button onClick={() => router.push(`/salaries/${salary.id}/allocate`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Allocation
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {allocations.map((allocation) => (
                  <div key={allocation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{allocation.category}</h3>
                      <p className="text-sm text-gray-500">
                        {allocation.percentage}% of salary
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(allocation.allocatedAmount, salary.currency)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {((allocation.allocatedAmount / salary.baseSalary) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
