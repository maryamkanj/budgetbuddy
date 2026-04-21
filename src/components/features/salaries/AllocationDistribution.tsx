'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2 } from 'lucide-react';
import { Database } from '@/types/database';
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

  const totalAllocatedPercentage = allocations.reduce((sum, alloc) => {
    const percentage = typeof alloc.percentage === 'string' ? parseFloat(alloc.percentage) : Number(alloc.percentage);
    return sum + (isNaN(percentage) ? 0 : percentage);
  }, 0);
  const remainingPercentage = Math.max(0, 100 - totalAllocatedPercentage);
  const remainingAmount = (selectedSalary.base_salary || 0) * remainingPercentage / 100;
  
  const colors = [
    '#2563eb', // Corporate Blue 600
    '#0ea5e9', // Sky 500
    '#10b981', // Emerald 500
    '#f59e0b', // Amber 500
    '#64748b'  // Slate 400
  ];

  return (
    <div className="flex flex-col h-full gap-8">
      {/* Premium Doughnut Chart Implementation */}
      <div className="relative w-64 h-64 mx-auto flex items-center justify-center group">
        <svg className="w-full h-full transform -rotate-90 select-none" viewBox="0 0 100 100">
          <defs>
            {colors.map((color, i) => (
              <linearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={`${color}cc`} />
              </linearGradient>
            ))}
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Ring */}
          <circle 
            cx="50" cy="50" r="42" 
            fill="none" 
            stroke="var(--card)" 
            strokeWidth="8" 
            className="opacity-20"
          />

          {allocations.length === 0 ? (
            <circle 
              cx="50" cy="50" r="42" 
              fill="none" 
              stroke="var(--border)" 
              strokeWidth="8" 
              strokeDasharray="264" 
              strokeDashoffset="0"
              className="opacity-30"
            />
          ) : (
            allocations.map((allocation, index) => {
              const percentage = typeof allocation.percentage === 'string' ? parseFloat(allocation.percentage) : Number(allocation.percentage);
              if (isNaN(percentage) || percentage === 0) return null;
              
              const previousPercentages = allocations.slice(0, index).reduce((sum, a) => {
                const prevPercentage = typeof a.percentage === 'string' ? parseFloat(a.percentage) : Number(a.percentage);
                return sum + (isNaN(prevPercentage) ? 0 : prevPercentage);
              }, 0);

              const strokeDasharray = `${(percentage * 264) / 100} 264`;
              const strokeDashoffset = `${-(previousPercentages * 264) / 100}`;
              
              return (
                <circle
                  key={allocation.id}
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke={`url(#grad-${index % colors.length})`}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out hover:stroke-[10px] cursor-pointer"
                  style={{ filter: 'url(#glow)' }}
                >
                  <title>{allocation.category}: {percentage}%</title>
                </circle>
              );
            })
          )}
          
          {remainingPercentage > 0 && totalAllocatedPercentage > 0 && (
            <circle 
              cx="50" cy="50" r="42" 
              fill="none" 
              stroke="var(--card)" 
              strokeWidth="8" 
              strokeDasharray={`${(remainingPercentage * 264) / 100} 264`} 
              strokeDashoffset={`${-(totalAllocatedPercentage * 264) / 100}`}
              strokeLinecap="round"
              className="opacity-30"
            />
          )}
        </svg>

        {/* Center Label - Piggy Vibe */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center animate-in fade-in zoom-in duration-700">
            <p className="text-4xl font-black tracking-tighter text-foreground font-mono">
              {totalAllocatedPercentage.toFixed(0)}%
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80">
              Allocated
            </p>
          </div>
        </div>
      </div>
      
      {/* Enhanced Allocation List */}
      <div className="space-y-4 flex-1 overflow-y-auto max-h-96 pr-2 scrollbar-hide">
        {allocations.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-border rounded-2xl bg-white/[0.02]">
            <p className="text-sm font-medium text-muted-foreground">Your salary is waiting to be stashed.</p>
            <p className="text-xs text-muted-foreground/60 mt-1 italic">Click &apos;Add Allocation&apos; to start planning.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {allocations.map((allocation, index) => {
              const percentage = typeof allocation.percentage === 'string' ? parseFloat(allocation.percentage) : Number(allocation.percentage);
              if (isNaN(percentage)) return null;
              
              return (
                <div key={allocation.id} className="relative group overflow-hidden">
                  {editingAllocationId === allocation.id ? (
                    <form onSubmit={handleUpdateAllocation} className="p-4 border border-primary/30 bg-primary/5 rounded-2xl space-y-3 animate-in slide-in-from-bottom-2 duration-300 shadow-lg shadow-black/20">
                      <div className="grid grid-cols-3 gap-2">
                         <Input 
                          value={editAllocationForm.category}
                          onChange={(e) => setEditAllocationForm(prev => ({ ...prev, category: e.target.value }))}
                          className="h-10 text-xs col-span-2 rounded-xl bg-background/50 border-white/10"
                          placeholder="Category"
                          autoFocus
                        />
                        <Input 
                          type="number"
                          value={editAllocationForm.percentage}
                          onChange={(e) => setEditAllocationForm(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                          className="h-10 text-xs rounded-xl font-mono bg-background/50 border-white/10"
                          placeholder="%"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" className="h-9 text-xs rounded-lg px-4" onClick={() => setEditingAllocationId(null)}>Cancel</Button>
                        <Button className="h-9 text-xs rounded-lg px-6 font-bold">Update Allocation</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-primary/20 hover:bg-white/[0.06] transition-all duration-300 group shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: colors[index % colors.length] }} />
                          <span className="text-sm font-black tracking-tight truncate">{allocation.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-muted-foreground/80">
                            {formatCurrency(allocation.allocated_amount || 0, selectedSalary.currency as 'USD' | 'LBP')}
                          </span>
                          <div className="flex opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0 gap-1">
                            <button onClick={() => handleEditAllocation(allocation)} className="p-1.5 rounded-lg bg-white/5 text-muted-foreground hover:text-primary transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteAllocation(allocation.id)} className="p-1.5 rounded-lg bg-white/5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                      <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out" 
                          style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: colors[index % colors.length],
                            boxShadow: `0 0 12px ${colors[index % colors.length]}50`
                          }} 
                        />
                      </div>
                      <div className="flex justify-between mt-1 px-0.5">
                        <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Allocation</span>
                        <span className="text-[10px] font-black text-primary/80">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {remainingPercentage > 0 && (
              <div className="p-5 bg-primary/[0.04] rounded-2xl border border-primary/10 border-dashed group transition-all hover:bg-primary/[0.06]">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                    <span className="text-xs font-black text-primary uppercase tracking-[0.1em]">Unallocated Balance</span>
                  </div>
                  <span className="text-xs font-mono text-primary font-black">
                    {formatCurrency(remainingAmount, selectedSalary.currency as 'USD' | 'LBP')}
                  </span>
                </div>
                <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                  <div className="bg-primary/40 h-full rounded-full transition-all duration-1000" style={{ width: `${remainingPercentage}%` }} />
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-[10px] text-primary/60 font-bold">
                    {remainingPercentage.toFixed(1)}% Available
                  </p>
                  <p className="text-[10px] text-primary/40 italic">Ready to be allocated</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
