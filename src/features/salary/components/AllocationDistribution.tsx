'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2 } from 'lucide-react';
import { Database } from '@/types/supabase';
import { formatCurrency } from '@/lib/utils/financial';

type Salary = Database['public']['Tables']['salaries']['Row'];
type SalaryAllocation = Database['public']['Tables']['salary_allocations']['Row'];

interface AllocationDistributionProps {
  selectedSalary: Salary | null;
  allocations: SalaryAllocation[];
  editingAllocationId: string | null;
  editAllocationForm: { category: string; percentage: number };
  setEditAllocationForm: React.Dispatch<React.SetStateAction<{ category: string; percentage: number }>>;
  setEditingAllocationId: (id: string | null) => void;
  handleEditAllocation: (allocation: SalaryAllocation) => void;
  handleUpdateAllocation: (e: React.FormEvent) => void;
  handleDeleteAllocation: (id: string) => void;
}

export function AllocationDistribution({
  selectedSalary,
  allocations,
  editingAllocationId,
  editAllocationForm,
  setEditAllocationForm,
  setEditingAllocationId,
  handleEditAllocation,
  handleUpdateAllocation,
  handleDeleteAllocation
}: AllocationDistributionProps) {
  if (!selectedSalary) return null;

  const totalAllocatedPercentage = allocations.reduce((sum, alloc) => sum + (alloc.percentage || 0), 0);
  const remainingPercentage = Math.max(0, 100 - totalAllocatedPercentage);
  const remainingAmount = (selectedSalary.base_salary || 0) * remainingPercentage / 100;
  
  const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

  return (
    <div className="bg-card border border-border rounded-lg p-4 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-2 text-center">Allocation Distribution</h3>
      
      <div className="text-center mb-4">
        <p className="text-2xl font-bold text-foreground">
          {formatCurrency(selectedSalary.base_salary || 0, selectedSalary.currency as 'USD' | 'LBP')}
        </p>
        <p className="text-sm text-muted-foreground">Total</p>
      </div>
      
      {allocations.length === 0 ? (
        <div className="relative w-48 h-48 mx-auto flex-1 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="35" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-bold text-muted-foreground">0%</p>
              <p className="text-xs text-muted-foreground">Allocated</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-48 h-48 mx-auto flex-1 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {allocations.map((allocation, index) => {
              const percentage = allocation.percentage || 0;
              const previousPercentages = allocations.slice(0, index).reduce((sum, a) => sum + (a.percentage || 0), 0);
              const startAngle = (previousPercentages / 100) * 360;
              const endAngle = ((previousPercentages + percentage) / 100) * 360;
              const x1 = 50 + 35 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 35 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 35 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 35 * Math.sin((endAngle * Math.PI) / 180);
              const largeArcFlag = percentage > 50 ? 1 : 0;
              const color = colors[index % colors.length];
              
              return (
                <g key={allocation.id}>
                  <path
                    d={`M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
            {remainingPercentage > 0 && (
              <circle cx="50" cy="50" r="35" fill="none" stroke="var(--card)" strokeWidth="2" strokeDasharray={`${remainingPercentage} 100`} strokeDashoffset={`${-(100 - remainingPercentage)}`} />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{totalAllocatedPercentage.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">Allocated</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 grid grid-cols-2 gap-2 text-2xs mb-4">
        {allocations.map((allocation, index) => (
          <div key={allocation.id} className="flex items-center gap-1.5 min-w-0">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[index % colors.length] }} />
            <span className="text-muted-foreground truncate">{allocation.category}</span>
          </div>
        ))}
        {remainingPercentage > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-card shrink-0" />
            <span className="text-muted-foreground truncate">Unallocated</span>
          </div>
        )}
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-1">
        {allocations.length === 0 ? (
          <div className="space-y-2 opacity-50">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium">Unallocated</span>
              <span>100% • {formatCurrency(selectedSalary.base_salary || 0, selectedSalary.currency as 'USD' | 'LBP')}</span>
            </div>
            <div className="w-full bg-card rounded-full h-4" />
          </div>
        ) : (
          <>
            {allocations.map((allocation, index) => (
              <div key={allocation.id} className="space-y-1">
                {editingAllocationId === allocation.id ? (
                  <form onSubmit={handleUpdateAllocation} className="p-2 border border-primary/20 bg-primary/5 rounded-md space-y-2">
                    <div className="flex gap-2">
                       <Input 
                        value={editAllocationForm.category}
                        onChange={(e) => setEditAllocationForm(prev => ({ ...prev, category: e.target.value }))}
                        className="h-7 text-xs"
                      />
                      <Input 
                        type="number"
                        value={editAllocationForm.percentage}
                        onChange={(e) => setEditAllocationForm(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                        className="h-7 text-xs w-16"
                      />
                    </div>
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setEditingAllocationId(null)}>Cancel</Button>
                      <Button size="sm" className="h-6 text-[10px]">Save</Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-medium truncate">{allocation.category}</span>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditAllocation(allocation)} className="p-0.5 text-muted-foreground hover:text-primary"><Edit className="w-3 h-3" /></button>
                          <button onClick={() => handleDeleteAllocation(allocation.id)} className="p-0.5 text-muted-foreground hover:text-brand-red"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                      <span className="text-2xs text-muted-foreground">
                        {allocation.percentage}% • {formatCurrency(allocation.allocated_amount || 0, selectedSalary.currency as 'USD' | 'LBP')}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3">
                      <div className="h-full rounded-full" style={{ width: `${allocation.percentage}%`, backgroundColor: colors[index % colors.length] }} />
                    </div>
                  </>
                )}
              </div>
            ))}
            {remainingPercentage > 0 && (
              <div className="space-y-1 pt-1 border-t border-border/50 mt-2">
                <div className="flex justify-between items-center text-2xs">
                  <span className="font-medium text-muted-foreground">Unallocated</span>
                  <span className="text-muted-foreground">{remainingPercentage.toFixed(1)}% • {formatCurrency(remainingAmount, selectedSalary.currency as 'USD' | 'LBP')}</span>
                </div>
                <div className="w-full bg-card rounded-full h-2">
                  <div className="bg-destructive/50 h-full rounded-full" style={{ width: `${remainingPercentage}%` }} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
