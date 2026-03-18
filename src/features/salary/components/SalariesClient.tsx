'use client';

import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useSalaries } from '@/providers/SalaryProvider';
import { useSubscription } from '@/providers/SubscriptionProvider';
import { SalaryFormModal } from '@/features/salary/components/SalaryFormModal';
import { DeleteConfirmModal } from '@/components/ui/deleteConfirmModal';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Database } from '@/types/supabase';
import { toast } from 'sonner';

type Salary = Database['public']['Tables']['salaries']['Row'];
type SalaryAllocation = Database['public']['Tables']['salary_allocations']['Row'];

interface SalaryFormValues {
  salary_name: string;
  base_salary: string;
  currency: 'USD' | 'LBP';
  company_name?: string;
}

interface AllocationFormValues {
  category: string;
  percentage: number;
}

interface SalariesContextType {
  salaries: Salary[];
  salaryAllocations: SalaryAllocation[];
  selectedSalaryId: string | null;
  setSelectedSalaryId: (id: string | null) => void;
  selectedSalary: Salary | null;
  currentAllocations: SalaryAllocation[];
  showSalaryForm: boolean;
  setShowSalaryForm: (show: boolean) => void;
  editingSalary: Salary | null;
  handleSalarySubmit: (data: SalaryFormValues) => Promise<void>;
  handleAddNewSalary: () => void;
  handleEditSalary: (s: Salary) => void;
  handleDeleteSalaryClick: () => void;
  confirmDeleteSalary: () => Promise<void>;
  showDeleteSalaryModal: boolean;
  setShowDeleteSalaryModal: (show: boolean) => void;
  handleAddAllocation: (allocation: AllocationFormValues) => Promise<void>;
  handleEditAllocation: (a: SalaryAllocation) => void;
  handleUpdateAllocation: (e: unknown) => Promise<void>;
  handleDeleteAllocationClick: (id: string) => void;
  confirmDeleteAllocation: () => Promise<void>;
  showDeleteAllocationModal: boolean;
  setShowDeleteAllocationModal: (show: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const SalariesContext = createContext<SalariesContextType | undefined>(undefined);

export function useSalariesPage() {
  const context = useContext(SalariesContext);
  if (!context) throw new Error('useSalariesPage must be used within SalariesClient');
  return context;
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
  const [allocationToDelete, setAllocationToDelete] = useState<string | null>(null);

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

  const currentAllocations = useMemo(() =>
    selectedSalaryId ? salaryAllocations.filter(a => a.salary_id === selectedSalaryId) : []
    , [salaryAllocations, selectedSalaryId]);

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
      setSelectedSalaryId(null);
      setShowDeleteSalaryModal(false);
      toast.success('Deleted', { id: toastId });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Deletion failed', { id: toastId });
    }
  }, [selectedSalaryId, deleteSalary]);

  const handleAddAllocation = useCallback(async (allocation: AllocationFormValues) => {
    if (!selectedSalaryId || !selectedSalary) return;
    const toastId = toast.loading('Adding...');
    try {
      const percentage = allocation.percentage ?? 0;
      const category = allocation.category ?? 'Uncategorized';
      const amount = (selectedSalary.base_salary * percentage) / 100;
      await createSalaryAllocation({
        salary_id: selectedSalaryId,
        category: category,
        percentage: percentage,
        allocated_amount: amount
      });
      toast.success('Added', { id: toastId });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Addition failed', { id: toastId });
    }
  }, [selectedSalaryId, selectedSalary, createSalaryAllocation]);

  const handleEditAllocation = useCallback(() => {
    // Note: Allocation editing is handled within AllocationForm components usually, 
    // but we keep the stub if needed for specialized page logic.
  }, []);

  const handleUpdateAllocation = useCallback(async () => {
    // Stub for specialized page logic
  }, []);

  const handleDeleteAllocationClick = useCallback((id: string) => {
    setAllocationToDelete(id);
    setShowDeleteAllocationModal(true);
  }, []);

  const confirmDeleteAllocation = useCallback(async () => {
    if (!allocationToDelete) return;
    const toastId = toast.loading('Deleting...');
    try {
      await deleteSalaryAllocation(allocationToDelete);
      setShowDeleteAllocationModal(false);
      toast.success('Removed', { id: toastId });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Removal failed', { id: toastId });
    }
  }, [allocationToDelete, deleteSalaryAllocation]);

  const contextValue = useMemo(() => ({
    salaries,
    salaryAllocations,
    selectedSalaryId,
    setSelectedSalaryId,
    selectedSalary,
    currentAllocations,
    showSalaryForm,
    setShowSalaryForm,
    editingSalary,
    handleSalarySubmit,
    handleAddNewSalary,
    handleEditSalary,
    handleDeleteSalaryClick,
    confirmDeleteSalary,
    showDeleteSalaryModal,
    setShowDeleteSalaryModal,
    handleAddAllocation,
    handleEditAllocation,
    handleUpdateAllocation,
    handleDeleteAllocationClick,
    confirmDeleteAllocation,
    showDeleteAllocationModal,
    setShowDeleteAllocationModal,
    mobileMenuOpen,
    setMobileMenuOpen
  }), [
    salaries,
    salaryAllocations,
    selectedSalaryId,
    selectedSalary,
    currentAllocations,
    showSalaryForm,
    editingSalary,
    handleSalarySubmit,
    handleAddNewSalary,
    handleEditSalary,
    handleDeleteSalaryClick,
    confirmDeleteSalary,
    showDeleteSalaryModal,
    handleAddAllocation,
    handleDeleteAllocationClick,
    confirmDeleteAllocation,
    showDeleteAllocationModal,
    mobileMenuOpen,
    handleUpdateAllocation,
    handleEditAllocation
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
        onConfirm={confirmDeleteAllocation}
        title="Delete Allocation"
        description="Are you sure you want to remove this category allocation?"
      />
    </SalariesContext.Provider>
  );
}

export function AddSalaryButton() {
  const { handleAddNewSalary } = useSalariesPage();
  return (
    <Button
      onClick={handleAddNewSalary}
      className="w-full sm:w-auto bg-gradient-to-r from-brand-blue to-brand-accent text-white hover:brightness-110 shadow-xl shadow-brand-blue/30 px-6 sm:px-10 py-5 sm:py-7 rounded-xl sm:rounded-[20px] text-base sm:text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] group"
    >
      <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 group-hover:rotate-90 transition-transform duration-300" />
      Add New Salary
    </Button>
  );
}
