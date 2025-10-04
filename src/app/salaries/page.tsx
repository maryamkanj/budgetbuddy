'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { localStorageService } from '@/lib/localStorage';
import { Salary, SalaryAllocation } from '@/types/salary';
import { User } from '@/types/user';
import { CATEGORIES } from '@/types/transaction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Plus, Trash2, PieChart } from 'lucide-react';
import { toast } from 'sonner';

export default function SalariesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [salary, setSalary] = useState<Salary | null>(null);
  const [allocations, setAllocations] = useState<SalaryAllocation[]>([]);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const router = useRouter();

  const [salaryForm, setSalaryForm] = useState({
    baseSalary: '',
    currency: 'USD' as 'USD' | 'LBP'
  });

  const [allocationForm, setAllocationForm] = useState({
    category: 'Food',
    percentage: ''
  });

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadSalaryData(currentUser.id);
  }, [router]);

  const loadSalaryData = (userId: string) => {
    const userSalary = localStorageService.getSalaryByUserId(userId);
    if (userSalary) {
      setSalary(userSalary);
      const salaryAllocations = localStorageService.getAllocationsBySalaryId(userSalary.id);
      setAllocations(salaryAllocations);
    }
  };

  const handleSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const salaryData = {
        userId: user.id,
        baseSalary: parseFloat(salaryForm.baseSalary),
        currency: salaryForm.currency
      };

      if (salary) {
        // Update existing salary
        const updatedSalary = { ...salary, ...salaryData };
        const allSalaries = localStorageService.getSalaries();
        const updatedSalaries = allSalaries.map(s => 
          s.id === salary.id ? updatedSalary : s
        );
        localStorageService.setSalaries(updatedSalaries);
        setSalary(updatedSalary);
        toast.success('Salary updated successfully');
      } else {
        // Add new salary
        const newSalary = localStorageService.addSalary(salaryData);
        setSalary(newSalary);
        toast.success('Salary set successfully');
      }

      setShowSalaryForm(false);
      setSalaryForm({ baseSalary: '', currency: 'USD' });
    } catch (error) {
      toast.error('Failed to save salary');
    }
  };

  const handleAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salary) return;

    const percentage = parseFloat(allocationForm.percentage);
    const currentTotal = allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);

    if (currentTotal + percentage > 100) {
      toast.error('Total allocation cannot exceed 100%');
      return;
    }

    // Check if category already exists
    const existingAllocation = allocations.find(alloc => alloc.category === allocationForm.category);
    if (existingAllocation) {
      toast.error('Category already allocated. Please edit the existing allocation.');
      return;
    }

    try {
      const allocationData = {
        salaryId: salary.id,
        category: allocationForm.category,
        percentage: percentage,
        allocatedAmount: (salary.baseSalary * percentage) / 100
      };

      const newAllocation = localStorageService.addSalaryAllocation(allocationData);
      setAllocations(prev => [...prev, newAllocation]);
      setAllocationForm({ category: 'Food', percentage: '' });
      toast.success('Allocation added successfully');
    } catch (error) {
      toast.error('Failed to add allocation');
    }
  };

  const handleDeleteAllocation = (allocationId: string) => {
    const updatedAllocations = allocations.filter(alloc => alloc.id !== allocationId);
    localStorageService.setSalaryAllocations(updatedAllocations);
    setAllocations(updatedAllocations);
    toast.success('Allocation removed successfully');
  };

  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
  const remainingPercentage = 100 - totalAllocated;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary?.currency === 'LBP' ? 'USD' : salary?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Salary Management</h1>
            <p className="text-gray-600">Plan your budget by allocating your salary</p>
          </div>
          {!salary && (
            <Button onClick={() => setShowSalaryForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Set Salary
            </Button>
          )}
        </div>

        {/* Salary Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Monthly Salary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {salary ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold">{formatAmount(salary.baseSalary)}</p>
                      <p className="text-gray-600">per month</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowSalaryForm(true);
                        setSalaryForm({
                          baseSalary: salary.baseSalary.toString(),
                          currency: salary.currency
                        });
                      }}
                    >
                      Edit Salary
                    </Button>
                  </div>

                  {/* Allocation Progress */}
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Salary Allocation</span>
                      <span>{totalAllocated}% allocated</span>
                    </div>
                    <Progress value={totalAllocated} className="h-3" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Remaining: {remainingPercentage}%</span>
                      <span>{formatAmount((salary.baseSalary * remainingPercentage) / 100)}</span>
                    </div>
                  </div>

                  {/* Add Allocation Form */}
                  <form onSubmit={handleAllocationSubmit} className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={allocationForm.category} 
                          onValueChange={(value) => setAllocationForm(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="percentage">Percentage (%)</Label>
                        <Input
                          id="percentage"
                          type="number"
                          step="0.01"
                          max={remainingPercentage}
                          value={allocationForm.percentage}
                          onChange={(e) => setAllocationForm(prev => ({ ...prev, percentage: e.target.value }))}
                          placeholder={`Max: ${remainingPercentage}%`}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="invisible">Add</Label>
                        <Button 
                          type="submit" 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={!allocationForm.percentage || parseFloat(allocationForm.percentage) <= 0}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Allocation
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No salary set</h3>
                  <p className="text-gray-500 mb-4">Set your monthly salary to start budget planning</p>
                  <Button onClick={() => setShowSalaryForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    Set Salary
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Allocations Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Allocations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allocations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No allocations yet. Add your first allocation above.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allocations.map((allocation) => (
                    <div key={allocation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-semibold">{allocation.category}</p>
                        <p className="text-sm text-gray-600">
                          {allocation.percentage}% • {formatAmount(allocation.allocatedAmount)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAllocation(allocation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {remainingPercentage > 0 && (
                    <div className="p-3 border border-dashed rounded-lg text-center">
                      <p className="text-sm text-gray-600">
                        {remainingPercentage}% unallocated
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatAmount((salary!.baseSalary * remainingPercentage) / 100)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Salary Form Modal */}
        {showSalaryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{salary ? 'Edit Salary' : 'Set Monthly Salary'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSalarySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseSalary">Monthly Salary</Label>
                    <Input
                      id="baseSalary"
                      type="number"
                      step="0.01"
                      value={salaryForm.baseSalary}
                      onChange={(e) => setSalaryForm(prev => ({ ...prev, baseSalary: e.target.value }))}
                      placeholder="Enter your monthly salary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={salaryForm.currency} 
                      onValueChange={(value: 'USD' | 'LBP') => setSalaryForm(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="LBP">LBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex-1">
                      {salary ? 'Update Salary' : 'Set Salary'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowSalaryForm(false);
                        setSalaryForm({ baseSalary: '', currency: 'USD' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}