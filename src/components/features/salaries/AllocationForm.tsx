'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils/financial';
import { useCategories } from '@/providers/CategoryProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_ALLOCATION_CATEGORIES } from '@/lib/actions/categoryConstants';
import { useFeatureAccess } from '@/providers/SubscriptionProvider';
import Link from 'next/link';
import { Database } from '@/types/database';

type Salary = Database['public']['Tables']['salaries']['Row'];
type SalaryAllocation = Database['public']['Tables']['salary_allocations']['Row'];

interface AllocationFormProps {
  salary: Salary;
  allocations: SalaryAllocation[];
  onAddAllocation: (allocation: Omit<SalaryAllocation, 'id' | 'created_at' | 'salary_id' | 'allocated_amount' | 'user_id'>) => void;
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
  const { hasCustomCategories } = useFeatureAccess();
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [allocationForm, setAllocationForm] = useState({
    category: '',
    percentage: '',
  });

  const { customCategories, addCustomCategory } = useCategories();

  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const customNames = customCategories
      .filter(cat => cat.type === 'allocation')
      .map(cat => cat.name);

    setCategories([...new Set([...DEFAULT_ALLOCATION_CATEGORIES, ...customNames])]);
  }, [customCategories]);

  const totalAllocated = allocations.reduce((sum, alloc) => sum + (Number(alloc.percentage) || 0), 0);
  const remainingPercentage = Math.max(0, Math.round((100 - totalAllocated + (Number(currentPercentage) || 0)) * 100) / 100);
  const currentAllocationPercentage = Math.round(totalAllocated * 100) / 100;

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

    const allocatedAmount = ((salary.base_salary || 0) * percentage) / 100;
    if (allocatedAmount > maxAmount) {
      toast.error(`Maximum allocation amount is ${formatCurrency(maxAmount, (salary.currency as 'USD' | 'LBP') || 'USD')}`);
      return;
    }

    let finalCategory = showCustomCategory ? customCategory : allocationForm.category;

    // Check for duplicate category
    const existingCategory = allocations.find(alloc => 
      alloc.category.toLowerCase().trim() === finalCategory.toLowerCase().trim()
    );
    
    if (existingCategory) {
      toast.error('Category already added');
      return;
    }

    if (showCustomCategory && customCategory.trim() && salary?.user_id) {
      if (!hasCustomCategories) {
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">Pro Feature</span>
            <span>Custom categories are available on the Pro plan.</span>
            <Link href="/subscription" className="text-primary hover:underline text-sm font-semibold">Upgrade now</Link>
          </div>
        );
        return;
      }

      try {
        const result = await addCustomCategory(customCategory.trim(), 'allocation');
        finalCategory = result.name;
      } catch (error) {
        console.error('Error saving custom category:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to save custom category');
        return;
      }
    }

    if (!finalCategory.trim()) {
      toast.error('Please select or enter a category');
      return;
    }

    try {
      const allocationData = {
        category: finalCategory,
        percentage,
      };

      await onAddAllocation(allocationData);

      setAllocationForm({ category: '', percentage: '' });
      setCustomCategory('');
      setShowCustomCategory(false);
    } catch (error) {
      console.error('Error adding allocation:', error);
    }
  };

  return (
    <div className={`space-y-4 h-full flex flex-col ${compact ? 'p-0' : 'p-4 md:p-6 border rounded-lg bg-card'}`}>
      {!compact && (
        <h3 className="font-semibold text-lg text-foreground">Add Allocation</h3>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium text-muted-foreground">
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
              <SelectTrigger className="w-full border-border">
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
                    className={`w-full justify-start ${hasCustomCategories ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground opacity-70'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasCustomCategories) {
                        setShowCustomCategory(true);
                      } else {
                        toast.error(
                          <div className="flex flex-col gap-1">
                            <span className="font-bold">Pro Feature</span>
                            <span>Custom categories are available on the Pro plan.</span>
                            <Link href="/subscription" className="text-primary hover:underline text-sm font-semibold">Upgrade now</Link>
                          </div>
                        );
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add custom category {!hasCustomCategories && '(Pro)'}
                  </Button>
                </div>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="percentage" className="text-sm font-medium text-muted-foreground">
              Percentage
            </Label>
            <span className="text-sm text-primary font-medium">
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
                  className="pr-12 text-lg border-border"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                  %
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Allocated: {currentAllocationPercentage.toFixed(1)}%</span>
                <span>Remaining: {remainingPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300 max-w-full"
                  style={{ width: `${currentAllocationPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 mt-auto"
          disabled={!allocationForm.category && !customCategory || !allocationForm.percentage}
        >
          Add Allocation
        </Button>
      </form>
    </div>
  );
}