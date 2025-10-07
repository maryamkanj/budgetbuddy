'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { localStorageService } from '@/lib/localStorage';
import { Salary, SalaryAllocation } from '@/types/salary';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Plus, Trash2, PieChart, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { AllocationForm } from '@/components/salary/AllocationForm';

// Helper function to format currency
const formatAmount = (amount: number, currency: 'USD' | 'LBP' = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'LBP' ? 'USD' : currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function SalariesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [selectedSalaryId, setSelectedSalaryId] = useState<string | null>(null);
  const [allocations, setAllocations] = useState<SalaryAllocation[]>([]);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const router = useRouter();

  const [salaryForm, setSalaryForm] = useState<{
    baseSalary: string;
    currency: 'USD' | 'LBP';
    id: string;
  }>({
    baseSalary: '',
    currency: 'USD',
    id: ''
  });
  
  const selectedSalary = selectedSalaryId ? salaries.find(s => s.id === selectedSalaryId) : null;


  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadSalaries(currentUser.id);
  }, [router]);

  const loadSalaries = (userId: string) => {
    const userSalaries = localStorageService.getSalaries().filter(s => s.userId === userId);
    setSalaries(userSalaries);
    
    // Select the first salary by default if none is selected
    if (userSalaries.length > 0 && !selectedSalaryId) {
      setSelectedSalaryId(userSalaries[0].id);
      loadAllocations(userSalaries[0].id);
    } else if (selectedSalaryId) {
      loadAllocations(selectedSalaryId);
    } else {
      setAllocations([]);
    }
  };
  
  const loadAllocations = (salaryId: string) => {
    const salaryAllocations = localStorageService.getAllocationsBySalaryId(salaryId);
    setAllocations(salaryAllocations);
  };

  // Calculate remaining percentage and amount
  const totalAllocatedPercentage = allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
  const remainingPercentage = 100 - totalAllocatedPercentage;
  const remainingAmount = selectedSalary ? (selectedSalary.baseSalary * remainingPercentage) / 100 : 0;
  
  // Calculate maximum amount that can be allocated based on remaining amount
  const getMaxAllocationAmount = (currentPercentage: number): number => {
    if (!selectedSalary) return 0;
    const maxPercentage = 100 - (totalAllocatedPercentage - currentPercentage);
    return (selectedSalary.baseSalary * maxPercentage) / 100;
  };

  const handleSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const salaryData = {
        userId: user.id,
        baseSalary: parseFloat(salaryForm.baseSalary),
        currency: salaryForm.currency,
        id: salaryForm.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedSalaries: Salary[] = [];
      const allSalaries = localStorageService.getSalaries();
      
      if (salaryForm.id) {
        // Update existing salary
        updatedSalaries = allSalaries.map(s => 
          s.id === salaryForm.id ? { ...s, ...salaryData, updatedAt: new Date().toISOString() } : s
        );
        toast.success('Salary updated successfully');
      } else {
        // Add new salary
        updatedSalaries = [...allSalaries, salaryData];
        setSelectedSalaryId(salaryData.id);
        toast.success('Salary added successfully');
      }
      
      localStorageService.setSalaries(updatedSalaries);
      setSalaries(updatedSalaries.filter(s => s.userId === user.id));
      setShowSalaryForm(false);
      setSalaryForm({ baseSalary: '', currency: 'USD', id: '' });
    } catch (error) {
      console.error('Error saving salary:', error);
      toast.error('Failed to save salary');
    }
  };

  const handleAddAllocation = (allocation: Omit<SalaryAllocation, 'id' | 'createdAt' | 'salaryId' | 'allocatedAmount'>) => {
    if (!selectedSalary) return;
    
    const allocatedAmount = (selectedSalary.baseSalary * allocation.percentage) / 100;
    const newAllocation = localStorageService.addSalaryAllocation({
      ...allocation,
      salaryId: selectedSalary.id,
      allocatedAmount
    });
    
    setAllocations(prev => [...prev, newAllocation]);
    toast.success('Allocation added successfully');
  };

  const handleDeleteAllocation = (id: string) => {
    const updatedAllocations = allocations.filter(alloc => alloc.id !== id);
    const allAllocations = localStorageService.getSalaryAllocations();
    const filteredAllocations = allAllocations.filter(alloc => alloc.id !== id);
    
    localStorageService.setSalaryAllocations(filteredAllocations);
    setAllocations(updatedAllocations);
    toast.success('Allocation removed');
  };

  const handleDeleteSalary = () => {
    if (!selectedSalary) return;
    
    try {
      // Remove salary
      const allSalaries = localStorageService.getSalaries();
      const updatedSalaries = allSalaries.filter(s => s.id !== selectedSalary.id);
      localStorageService.setSalaries(updatedSalaries);
      
      // Remove related allocations
      const allAllocations = localStorageService.getSalaryAllocations();
      const updatedAllocations = allAllocations.filter(alloc => alloc.salaryId !== selectedSalary.id);
      localStorageService.setSalaryAllocations(updatedAllocations);
      
      // Update state
      const remainingSalaries = updatedSalaries.filter(s => s.userId === user?.id);
      setSalaries(remainingSalaries);
      
      // Select another salary if available
      if (remainingSalaries.length > 0) {
        setSelectedSalaryId(remainingSalaries[0].id);
        loadAllocations(remainingSalaries[0].id);
      } else {
        setSelectedSalaryId(null);
        setAllocations([]);
      }
      
      setShowSalaryForm(false);
      
      toast.success('Salary and all related allocations have been deleted');
    } catch (error) {
      console.error('Error deleting salary:', error);
      toast.error('Failed to delete salary');
    }
  };
  
  const handleAddNewSalary = () => {
    setSalaryForm({
      baseSalary: '',
      currency: 'USD',
      id: ''
    });
    setShowSalaryForm(true);
  };
  
  const handleEditSalary = (salary: Salary) => {
    setSalaryForm({
      baseSalary: salary.baseSalary.toString(),
      currency: salary.currency,
      id: salary.id
    });
    setShowSalaryForm(true);
  };
  
  const handleSelectSalary = (salaryId: string) => {
    setSelectedSalaryId(salaryId);
    loadAllocations(salaryId);
  };
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex flex-col gap-6">
        {/* Salary Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {salaries.map(s => (
            <Button
              key={s.id}
              variant={selectedSalaryId === s.id ? 'default' : 'outline'}
              onClick={() => handleSelectSalary(s.id)}
              className="shrink-0"
            >
              {formatAmount(s.baseSalary, s.currency)}
            </Button>
          ))}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleAddNewSalary}
            title="Add new salary"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Salary Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                {selectedSalary ? 'Salary Overview' : 'Set Up Your Salary'}
              </CardTitle>
              {selectedSalary && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSalary()}
                    className="text-red-600 hover:bg-red-50"
                    title="Delete salary"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (selectedSalary) {
                        setSalaryForm({
                          baseSalary: selectedSalary.baseSalary.toString(),
                          currency: selectedSalary.currency,
                          id: selectedSalary.id
                        });
                        setShowSalaryForm(true);
                      }
                    }}
                    title="Edit salary"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {selectedSalary && (
              <CardDescription className="text-sm text-gray-500">
                Manage your monthly salary and allocations
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            {selectedSalary ? (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatAmount(selectedSalary.baseSalary, selectedSalary.currency)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Monthly salary • {selectedSalary.currency}
                      </p>
                    </div>
                    {/* Removed New Allocation button as it was causing confusion with salary entry */}
                  </div>
                </div>

                {/* Allocation Progress */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Allocation Progress</h3>
                    <div className="text-sm text-gray-600">
                      {100 - remainingPercentage}% allocated
                    </div>
                  </div>
                  <Progress value={100 - remainingPercentage} className="h-2" />
                </div>

                {/* Allocation Form */}
                {allocations.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <PieChart className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <h3 className="font-medium text-gray-700">No allocations yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Add your first allocation to get started</p>
                    <AllocationForm 
                      salary={selectedSalary} 
                      allocations={allocations} 
                      onAddAllocation={handleAddAllocation}
                      compact={false}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AllocationForm 
                      salary={selectedSalary} 
                      allocations={allocations} 
                      onAddAllocation={handleAddAllocation}
                      compact={true}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-blue-50 p-6 rounded-full inline-flex mb-4">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No salary set</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Set up your monthly salary to start planning your budget and allocations</p>
                <Button 
                  onClick={handleAddNewSalary}
                  className="bg-blue-600 hover:bg-blue-700 px-6 h-10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Set Up Salary
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Allocations Summary */}
        {selectedSalary && allocations.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  Allocations
                </CardTitle>
                <div className="text-sm text-gray-500">
                  {allocations.length} {allocations.length === 1 ? 'category' : 'categories'}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {allocations.map((allocated) => (
                  <div 
                    key={allocated.id} 
                    className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{allocated.category}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-medium text-blue-600">
                          {allocated.percentage}%
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatAmount(allocated.allocatedAmount, selectedSalary.currency)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAllocation(allocated.id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-transparent"
                      title="Remove allocation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {remainingPercentage > 0 && (
                  <div className="p-3 border-2 border-dashed border-gray-200 rounded-lg text-center bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">
                      {remainingPercentage.toFixed(2)}% unallocated
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatAmount(remainingAmount, selectedSalary.currency)} available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Salary Form Modal */}
      {showSalaryForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{salaryForm.id ? 'Edit Salary' : 'Set Monthly Salary'}</CardTitle>
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
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="LBP">LBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex-1">
                    {salaryForm.id ? 'Update Salary' : 'Set Salary'}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowSalaryForm(false);
                      setSalaryForm({ 
                        baseSalary: selectedSalary ? selectedSalary.baseSalary.toString() : '', 
                        currency: selectedSalary ? selectedSalary.currency : 'USD', 
                        id: selectedSalary ? selectedSalary.id : '' 
                      });
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
  );
}