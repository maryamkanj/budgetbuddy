'use client';

import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useGoals } from '@/providers/GoalProvider';
import { useUsageLimits } from '@/providers/SubscriptionProvider';
import { Database } from '@/types/database';
import { toast } from 'sonner';
import { GoalFormModal } from '@/components/features/goals/GoalFormModal';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Goal = Database['public']['Tables']['goals']['Row'];

interface GoalsContextType {
  openAddModal: () => void;
  openEditModal: (g: Goal) => void;
  openDeleteModal: (id: string) => void;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export function useGoalsPage() {
  const context = useContext(GoalsContext);
  if (!context) throw new Error('useGoalsPage must be used within GoalsClient');
  return context;
}

export function GoalsClient({ children }: { children: React.ReactNode }) {
  const { goals, createGoal, updateGoal, deleteGoal } = useGoals();
  const limits = useUsageLimits();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && goals.length > 0) {
      const goal = goals.find((g: Goal) => g.id === editId);
      if (goal) {
        setEditingGoal(goal);
        setShowModal(true);
        router.replace(pathname);
      }
    }
  }, [searchParams, goals, router, pathname]);

  const openAddModal = () => {
    setEditingGoal(null);
    setShowModal(true);
  };

  const openEditModal = (g: Goal) => {
    setEditingGoal(g);
    setShowModal(true);
  };

  const openDeleteModal = (id: string) => {
    setGoalToDelete(id);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (data: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const toastId = toast.loading(editingGoal ? 'Updating goal...' : 'Creating goal...');
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, data as Database['public']['Tables']['goals']['Update']);
        toast.success('Goal updated successfully!', { id: toastId });
      } else {
        if (goals.length >= limits.goals.limit) {
          toast.error('Plan limit reached. Please upgrade to add more goals.', { id: toastId });
          return;
        }
        await createGoal(data);
        toast.success('Goal created successfully!', { id: toastId });
      }
      setShowModal(false);
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Failed to save';
      toast.error(message, { id: toastId });
    }
  };

  const handleConfirmDelete = async () => {
    if (!goalToDelete) return;
    setShowDeleteModal(false);
    try {
      await deleteGoal(goalToDelete);
      toast.success('Deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete');
    } finally {
      setGoalToDelete(null);
    }
  };

  const contextValue = useMemo(() => ({
    openAddModal,
    openEditModal,
    openDeleteModal
  }), []);

  return (
    <GoalsContext.Provider value={contextValue}>
      {children}
      
      <GoalFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        editingGoal={editingGoal}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Goal"
        description="Are you sure you want to delete this goal? This will remove all progress data. This action cannot be undone."
      />
    </GoalsContext.Provider>
  );
}

export function AddGoalButton() {
  const { openAddModal } = useGoalsPage();
  return (
    <Button
      onClick={openAddModal}
      size="lg"
      className="bg-gradient-to-r from-brand-blue to-brand-accent hover:scale-[1.02] active:scale-[0.98] transition-all text-white font-bold h-14 px-8 rounded-2xl shadow-xl shadow-brand-blue/20 w-full sm:w-auto"
    >
      <Plus className="h-5 w-5 mr-2 stroke-[3]" />
      New Goal
    </Button>
  );
}
