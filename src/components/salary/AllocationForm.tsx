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
import { CategoryService } from '@/lib/categoryService';

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
  
  // Use CategoryService to get categories
  const [categories, setCategories] = useState<string[]>([]);
  
  useEffect(() => {
    if (salary?.userId) {
      // Get combined categories (default + custom) for allocation type
      const combinedCategories = CategoryService.getCombinedCategories(salary.userId, 'allocation');
      setCategories(combinedCategories);
    }
  }, [salary?.userId]);

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

    // Determine the final category name
    let finalCategory = showCustomCategory ? customCategory : allocationForm.category;
    
    // If it's a custom category, save it to the CategoryService
    if (showCustomCategory && customCategory.trim() && salary?.userId) {
      try {
        const newCategory = CategoryService.addCustomCategory(customCategory.trim(), salary.userId, 'allocation');
        finalCategory = newCategory.name;
        
        // Update the categories list
        const updatedCategories = CategoryService.getCombinedCategories(salary.userId, 'allocation');
        setCategories(updatedCategories);
      } catch (error) {
        console.error('Error saving custom category:', error);
        toast.error('Failed to save custom category');
        return;
      }
    }
    
    if (!finalCategory.trim()) {
      toast.error('Please select or enter a category');
      return;
    }
    
    try {
      // Create the allocation object with only the required properties
      const allocationData = {
        category: finalCategory,
        percentage,
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
    <div className={`space-y-4 ${compact ? 'p-0' : 'p-4 md:p-6 border rounded-lg bg-white'}`}>
      <h3 className="font-semibold text-lg text-gray-900">Add Allocation</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium text-gray-700">
            Category
          </Label>
          {showCustomCategory ? (
            <div className="flex gap-2">
              <Input
                id="customCategory"
                placeholder="Enter category name"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowCustomCategory(false)}
                className="shrink-0"
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
                <div className="border-t pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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

        {/* Percentage Input */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="percentage" className="text-sm font-medium text-gray-700">
              Percentage
            </Label>
            <span className="text-sm text-blue-600 font-medium">
              {remainingPercentage.toFixed(1)}% remaining
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="number"
                  min="0.01"
                  max={remainingPercentage}
                  step="0.01"
                  placeholder="0.00"
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
                  className="pr-12 text-lg"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  %
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Allocated: {currentAllocationPercentage.toFixed(1)}%</span>
                <span>Remaining: {remainingPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
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
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
          disabled={!allocationForm.category && !customCategory || !allocationForm.percentage}
        >
          Add Allocation
        </Button>
      </form>
    </div>
  );
}