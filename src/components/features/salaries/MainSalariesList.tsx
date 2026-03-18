'use client';

import React from 'react';
import { useSalariesPage } from './SalariesClient';
import { SalaryList } from './SalaryList';
import { SalaryOverview } from './SalaryOverview';
import { SalarySummaryCards } from './SalarySummaryCards';
import { Card } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

export function MainSalariesList() {
  const {
    salaries,
    selectedSalaryId,
    setSelectedSalaryId,
    selectedSalary,
    currentAllocations,
    handleEditSalary,
    handleDeleteSalaryClick,
    handleAddAllocation,
    handleAddNewSalary,
    mobileMenuOpen,
    setMobileMenuOpen
  } = useSalariesPage();

  if (salaries.length === 0) {
    return (
      <Card className="bg-card/20 border-2 border-dashed border-border p-12 sm:p-24 text-center rounded-xl backdrop-blur-sm group mt-8">
        <div className="flex flex-col items-center gap-6">
          <div className="p-8 bg-white/5 rounded-2xl ring-1 ring-border group-hover:scale-110 transition-transform duration-500 shadow-xl">
            <Wallet className="h-12 w-12 text-muted-foreground opacity-20" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">No salaries defined</h3>
            <p className="text-muted-foreground text-base max-w-sm mx-auto font-medium opacity-60">
              Add your first salary to start tracking your distribution and budget allocations.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 mt-8">
      <SalarySummaryCards
        salaries={salaries}
        salaryAllocations={currentAllocations}
      />

      <div className="space-y-6">
        <SalaryList
          salaries={salaries}
          selectedSalaryId={selectedSalaryId}
          onSelectSalary={setSelectedSalaryId}
          onAddNewSalary={handleAddNewSalary}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {selectedSalary && (
          <SalaryOverview
            selectedSalary={selectedSalary}
            allocations={currentAllocations}
            onEditSalary={handleEditSalary}
            onDeleteSalary={handleDeleteSalaryClick}
            onAddAllocation={handleAddAllocation}
          />
        )}
      </div>
    </div>
  );
}
