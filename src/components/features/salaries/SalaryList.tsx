'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown } from 'lucide-react';
import { Database } from '@/types/database';

type Salary = Database['public']['Tables']['salaries']['Row'];

interface SalaryListProps {
  salaries: Salary[];
  selectedSalaryId: string | null;
  onSelectSalary: (id: string) => void;
  onAddNewSalary: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function SalaryList({
  salaries,
  selectedSalaryId,
  onSelectSalary,
  onAddNewSalary,
  mobileMenuOpen,
  setMobileMenuOpen
}: SalaryListProps) {
  if (salaries.length === 0) return null;

  const selectedSalary = salaries.find(s => s.id === selectedSalaryId);

  return (
    <div className="space-y-4">
      <div className="sm:hidden relative">
        <Button
          variant="outline"
          className="w-full justify-between border-border"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="truncate">
            {selectedSalary ? selectedSalary.salary_name || 'Unnamed Salary' : 'Select Salary'}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
        </Button>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-md shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            {salaries.map(s => (
              <button
                key={s.id}
                className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-secondary ${selectedSalaryId === s.id ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}`}
                onClick={() => onSelectSalary(s.id)}
              >
                {s.salary_name || 'Unnamed Salary'}
              </button>
            ))}
            <button
              className="w-full text-left px-4 py-3 text-sm text-primary font-medium border-t border-border flex items-center gap-2 hover:bg-secondary"
              onClick={onAddNewSalary}
            >
              <Plus className="h-4 w-4" />
              Add New Salary
            </button>
          </div>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {salaries.map(s => (
          <Button
            key={s.id}
            variant={selectedSalaryId === s.id ? 'default' : 'outline'}
            onClick={() => onSelectSalary(s.id)}
            className="shrink-0 rounded-full px-5"
          >
            {s.salary_name || 'Unnamed Salary'}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={onAddNewSalary}
          title="Add new salary"
          className="shrink-0 rounded-full border-dashed"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
