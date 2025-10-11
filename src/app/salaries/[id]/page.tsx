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
import { ArrowLeft, Edit, Trash2, Plus, PieChart } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900">Loading salary details...</h1>
        </div>
      </div>
    );
  }

  if (error || !salary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 p-4 rounded-full inline-flex mb-4">
            <Trash2 className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Salary not found'}</p>
          <Link href="/salaries">
            <Button className="bg-blue-600 hover:bg-blue-700">
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
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-3">
            <Link href="/salaries">
              <Button variant="outline" size="sm" className="mt-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {salary.name || 'Salary Details'}
              </h1>
              <p className="text-gray-600 mt-1">
                Created on {new Date(salary.createdAt).toLocaleDateString()}
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
              onClick={handleDelete}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                Salary Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Base Salary</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(salary.baseSalary, salary.currency)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Currency</p>
                  <p className="text-lg font-medium text-gray-900">{salary.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created On</p>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(salary.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-green-600" />
                Allocation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Allocated</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(totalAllocated, salary.currency)}
                    <span className="text-gray-500 ml-1">
                      ({allocatedPercentage.toFixed(1)}%)
                    </span>
                  </span>
                </div>
                <Progress value={allocatedPercentage} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Remaining</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(remainingAmount, salary.currency)}
                    <span className="text-gray-500 ml-1">
                      ({remainingPercentage.toFixed(1)}%)
                    </span>
                  </span>
                </div>
                <Progress value={remainingPercentage} className="h-2 bg-green-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Allocations */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl">Allocations</CardTitle>
              <Button 
                size="sm" 
                onClick={() => router.push(`/salaries/${salary.id}/allocate`)}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Allocation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {allocations.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <PieChart className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 mb-4 text-lg">No allocations yet</p>
                <Button 
                  onClick={() => router.push(`/salaries/${salary.id}/allocate`)}
                  className="bg-blue-600 hover:bg-blue-700"
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
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{allocation.category}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {allocation.percentage}% of salary
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
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