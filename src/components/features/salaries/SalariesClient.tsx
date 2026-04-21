'use client';

import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useSalaries } from '@/providers/SalaryProvider';
import { useSubscription } from '@/providers/SubscriptionProvider';
import { SalaryFormModal } from '@/components/features/salaries/SalaryFormModal';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Salary, 
  SalaryAllocation, 
  SalaryFormValues, 
  AllocationFormValues,
  SalariesContextType 
} from '@/types/salaries';
import { toast } from 'sonner';
import { refreshSalariesAction } from '@/lib/actions/salaries';

const SalariesContext = createContext<SalariesContextType | undefined>(undefined);

export function useSalariesPage() {
  const context = useContext(SalariesContext);
  if (!context) throw new Error('useSalariesPage must be used within SalariesClient');
  return context;
}

export function AddSalaryButton() {
  const { handleAddNewSalary } = useSalariesPage();
  return (
    <Button
      onClick={handleAddNewSalary}
      className="w-full sm:w-auto bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl px-8 h-12 font-bold text-sm tracking-tight transition-all hover:translate-y-[-1px] active:translate-y-[0px] hover:shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-2 group"
    >
      <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
      Add New Salary
    </Button>
  );
}

export function SalariesClient({
  children,
  initialSalaries = [],
  initialAllocations = []
}: {
  children: React.ReactNode;
  initialSalaries?: Salary[];
  initialAllocations?: SalaryAllocation[];
}) {
  const {
    salaries,
    salaryAllocations,
    initializeSalaries,
    createSalary,
    updateSalary,
    deleteSalary,
    createSalaryAllocation,
    deleteSalaryAllocation
  } = useSalaries();

  const { plan } = useSubscription();

  // UI State
  const [selectedSalaryId, setSelectedSalaryId] = useState<string | null>(null);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [editingSalary, setEditingSalary] = useState<Salary | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showDeleteSalaryModal, setShowDeleteSalaryModal] = useState(false);
  const [showDeleteAllocationModal, setShowDeleteAllocationModal] = useState(false);

  // Initialize global provider with server data
  useEffect(() => {
    initializeSalaries(initialSalaries, initialAllocations);
    if (!selectedSalaryId && initialSalaries.length > 0) {
      setSelectedSalaryId(initialSalaries[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSalaries, initialAllocations, initializeSalaries]);

  const selectedSalary = useMemo(() =>
    selectedSalaryId ? salaries.find(s => s.id === selectedSalaryId) || null : null
    , [salaries, selectedSalaryId]);

  const currentAllocations = useMemo(() => {
    const filtered = selectedSalaryId ? salaryAllocations.filter(a => a.salary_id === selectedSalaryId) : [];
    console.log('Current allocations calculation:', {
      selectedSalaryId,
      allSalaryAllocations: salaryAllocations,
      filteredAllocations: filtered
    });
    return filtered;
  }, [salaryAllocations, selectedSalaryId]);

  const handleSalarySubmit = useCallback(async (data: SalaryFormValues) => {
    const toastId = toast.loading(editingSalary ? 'Updating salary...' : 'Creating salary...');
    try {
      const salaryData = {
        base_salary: parseFloat(data.base_salary),
        currency: data.currency,
        salary_name: data.salary_name,
        company_name: data.company_name || null,
      };

      if (editingSalary) {
        await updateSalary(editingSalary.id, salaryData);
        toast.success('Salary updated!', { id: toastId });
      } else {
        if (salaries.length >= plan.limits.salaries) {
          toast.error('Plan limit reached', { id: toastId });
          return;
        }
        const res = await createSalary(salaryData);
        setSelectedSalaryId(res.id);
        toast.success('Salary created!', { id: toastId });
      }
      setShowSalaryForm(false);
      setEditingSalary(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Operation failed', { id: toastId });
    }
  }, [editingSalary, plan.limits.salaries, salaries.length, createSalary, updateSalary]);

  const handleAddNewSalary = useCallback(() => {
    setEditingSalary(null);
    setShowSalaryForm(true);
  }, []);

  const handleEditSalary = useCallback((s: Salary) => {
    setEditingSalary(s);
    setShowSalaryForm(true);
  }, []);

  const handleDeleteSalaryClick = useCallback(() => {
    if (selectedSalaryId) setShowDeleteSalaryModal(true);
  }, [selectedSalaryId]);

  const confirmDeleteSalary = useCallback(async () => {
    if (!selectedSalaryId) return;
    const toastId = toast.loading('Deleting...');
    try {
      await deleteSalary(selectedSalaryId);
      
      // Auto-select the next available salary
      const remainingSalaries = salaries.filter(s => s.id !== selectedSalaryId);
      if (remainingSalaries.length > 0) {
        // Select the first remaining salary
        setSelectedSalaryId(remainingSalaries[0].id);
      } else {
        // No salaries left, set to null
        setSelectedSalaryId(null);
      }
      
      setShowDeleteSalaryModal(false);
      toast.success('Deleted', { id: toastId });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Deletion failed', { id: toastId });
    }
  }, [selectedSalaryId, deleteSalary, salaries]);

  const handleAddAllocation = useCallback(async (allocation: AllocationFormValues) => {
    if (!selectedSalaryId || !selectedSalary) return;
    const toastId = toast.loading('Adding...');
    try {
      const percentage = allocation.percentage ?? 0;
      const category = allocation.category ?? 'Uncategorized';
      const amount = (selectedSalary.base_salary * percentage) / 100;
      
      console.log('Creating allocation:', { salary_id: selectedSalaryId, category, percentage, amount });
      
      await createSalaryAllocation({
        salary_id: selectedSalaryId,
        category: category,
        percentage: percentage,
        allocated_amount: amount
      });
      toast.success('Added', { id: toastId });
      
      // Refresh the data to show the new allocation
      console.log('Refreshing salaries data...');
      const result = await refreshSalariesAction();
      console.log('Refresh result:', result);
      
      if (result.success && result.data) {
        console.log('Updating state with new data:', result.data);
        initializeSalaries(result.data.salaries, result.data.salaryAllocations);
      } else {
        console.error('Failed to refresh data:', result);
      }
    } catch (err: unknown) {
      console.error('Error adding allocation:', err);
      toast.error(err instanceof Error ? err.message : 'Addition failed', { id: toastId });
    }
  }, [selectedSalaryId, selectedSalary, createSalaryAllocation, initializeSalaries]);

  // TODO: Implement allocation deletion functionality
  // const confirmDeleteAllocation = useCallback(async () => {
  //   if (!allocationToDelete) return;
  //   const toastId = toast.loading('Deleting...');
  //   try {
  //     await deleteSalaryAllocation(allocationToDelete);
  //     setShowDeleteAllocationModal(false);
  //     toast.success('Removed', { id: toastId });
  //   } catch (err: unknown) {
  //     toast.error(err instanceof Error ? err.message : 'Removal failed', { id: toastId });
  //   }
  // }, [allocationToDelete, deleteSalaryAllocation]);

  const placeholderConfirmDeleteAllocation = () => {
    // Placeholder until allocation deletion is implemented
    setShowDeleteAllocationModal(false);
  };

  const contextValue = useMemo(() => ({
    salaries,
    salaryAllocations,
    selectedSalaryId,
    setSelectedSalaryId,
    selectedSalary,
    currentAllocations,
    initializeSalaries,
    createSalary,
    updateSalary,
    deleteSalary,
    createSalaryAllocation,
    deleteSalaryAllocation,
    handleAddNewSalary,
    handleEditSalary,
    handleDeleteSalaryClick,
    handleAddAllocation,
    mobileMenuOpen,
    setMobileMenuOpen
  }), [
    salaries,
    salaryAllocations,
    selectedSalaryId,
    selectedSalary,
    currentAllocations,
    initializeSalaries,
    createSalary,
    updateSalary,
    deleteSalary,
    createSalaryAllocation,
    deleteSalaryAllocation,
    handleAddNewSalary,
    handleEditSalary,
    handleDeleteSalaryClick,
    handleAddAllocation,
    mobileMenuOpen,
    setMobileMenuOpen
  ]);

  return (
    <SalariesContext.Provider value={contextValue}>
      {children}

      <SalaryFormModal
        isOpen={showSalaryForm}
        onClose={() => setShowSalaryForm(false)}
        onSubmit={handleSalarySubmit}
        editingSalary={editingSalary}
      />

      <DeleteConfirmModal
        isOpen={showDeleteSalaryModal}
        onClose={() => setShowDeleteSalaryModal(false)}
        onConfirm={confirmDeleteSalary}
        title="Delete Salary"
        description="Are you sure you want to delete this salary and all its allocations?"
        itemName={selectedSalary?.salary_name || undefined}
      />

      <DeleteConfirmModal
        isOpen={showDeleteAllocationModal}
        onClose={() => setShowDeleteAllocationModal(false)}
        onConfirm={placeholderConfirmDeleteAllocation}
        title="Delete Allocation"
        description="Are you sure you want to remove this category allocation?"
      />
    </SalariesContext.Provider>
  );
}
