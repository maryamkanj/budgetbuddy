'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/currency-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Salary, SalaryAllocation } from '@/types/salary';
// Import any necessary services or utilities here

interface AllocationFormProps {
  salary: Salary;
  allocations: SalaryAllocation[];
  onAddAllocation: (allocation: Omit<SalaryAllocation, 'id' | 'createdAt' | 'salaryId' | 'allocatedAmount'>) => void;
  compact?: boolean;
  maxAmount?: number;
  currentPercentage?: number;
}

export function AllocationForm({ 
  salary,
  allocations = [], 
  onAddAllocation, 
  compact = false, 
  maxAmount = Infinity,
  currentPercentage = 0
}: AllocationFormProps): React.JSX.Element {
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [allocationForm, setAllocationForm] = useState({
    category: '',
    percentage: '',
  });
  
  // Define categories state
  const [categories, setCategories] = useState<string[]>([
    'Housing', 'Transportation', 'Food', 'Utilities', 'Insurance', 
    'Healthcare', 'Savings', 'Entertainment', 'Other'
  ]);
  
  const remainingPercentage = 100 - (allocations.reduce((sum, alloc) => sum + alloc.percentage, 0) || 0) + (currentPercentage || 0);
  const currentAllocationPercentage = allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const percentage = parseFloat(allocationForm.percentage);
    if (isNaN(percentage) || percentage <= 0) {
      toast.error('Please enter a valid percentage');
      return;
    }
    
    if (percentage > remainingPercentage) {
      toast.error(`You can only allocate up to ${remainingPercentage}%`);
      return;
    }
    
    const allocatedAmount = (salary.baseSalary * percentage) / 100;
    if (allocatedAmount > maxAmount) {
      toast.error(`Maximum allocation amount is ${formatCurrency(maxAmount, salary.currency)}`);
      return;
    }
    
    try {
      // Create the allocation object with only the required properties
      const allocationData = {
        category: showCustomCategory ? customCategory : allocationForm.category,
        percentage,
        // Removed createdAt, salaryId, and id as they're not in the expected type
      };
      
      onAddAllocation(allocationData);
      
      // Reset form
      setAllocationForm({ category: '', percentage: '' });
      setCustomCategory('');
      setShowCustomCategory(false);
      
      toast.success('Allocation added successfully');
    } catch (error) {
      console.error('Error adding allocation:', error);
      toast.error('Failed to add allocation');
    }
  };

  return (
    <div className={`space-y-4 ${compact ? 'p-0' : 'p-4 border rounded-lg'}`}>
      <h3 className="font-medium">Add Allocation</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="category">Category</Label>
          {showCustomCategory ? (
            <div className="flex gap-2">
              <Input
                id="customCategory"
                placeholder="Enter category name"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowCustomCategory(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Select
              value={allocationForm.category}
              onValueChange={(value) =>
                setAllocationForm(prev => ({
                  ...prev,
                  category: value
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCustomCategory(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add custom category
                  </Button>
                </div>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="percentage">Percentage</Label>
          <span className="text-sm text-muted-foreground">
            {remainingPercentage}% remaining
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            min="0.01"
            max={remainingPercentage}
            step="0.01"
            placeholder="%"
            value={allocationForm.percentage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setAllocationForm(prev => ({
                  ...prev,
                  percentage: value
                }));
              }
            }}
            className="pr-8"
          />
          <span className="flex items-center">%</span>
          <div className="flex-1 flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${currentAllocationPercentage}%`,
                  maxWidth: '100%'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full mt-2"
        disabled={!allocationForm.category || !allocationForm.percentage}
      >
        Add Allocation
      </Button>
    </div>
  );
}
