'use client';

import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTransactions } from '@/providers/TransactionProvider';
import { useCategories } from '@/providers/CategoryProvider';
import { useUsageLimits } from '@/providers/SubscriptionProvider';
import { Database } from '@/types/database';
import { toast } from 'sonner';
import { TransactionFormModal } from '@/components/features/transactions/TransactionFormModal';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface TransactionsContextType {
  openAddModal: () => void;
  openEditModal: (t: Transaction) => void;
  openDeleteModal: (id: string) => void;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function useTransactionsPage() {
  const context = useContext(TransactionsContext);
  if (!context) throw new Error('useTransactionsPage must be used within TransactionsClient');
  return context;
}

export function TransactionsClient({ children }: { children: React.ReactNode }) {
  const { transactions, createTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { customCategories, addCustomCategory } = useCategories();
  const limits = useUsageLimits();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && transactions.length > 0) {
      const transaction = transactions.find(t => t.id === editId);
      if (transaction) {
        setEditingTransaction(transaction);
        setShowModal(true);
        router.replace(pathname);
      }
    }
  }, [searchParams, transactions, router, pathname]);

  const openAddModal = () => {
    setEditingTransaction(null);
    setShowModal(true);
  };

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setShowModal(true);
  };

  const openDeleteModal = (id: string) => {
    setTransactionToDelete(id);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const toastId = toast.loading(editingTransaction ? 'Updating transaction...' : 'Adding transaction...');
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, data as Database['public']['Tables']['transactions']['Update']);
        toast.success('Transaction updated successfully!', { id: toastId });
      } else {
        if (limits.transactions.current >= limits.transactions.limit) {
          toast.error('Monthly transaction limit reached. Please upgrade to add more.', { id: toastId });
          return;
        }
        await createTransaction(data);
        toast.success('Transaction added successfully!', { id: toastId });
      }
      setShowModal(false);
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Failed to save';
      toast.error(message, { id: toastId });
    }
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    setShowDeleteModal(false);
    try {
      await deleteTransaction(transactionToDelete);
      toast.success('Deleted successfully');
    } catch (error: unknown) {
      console.error(error);
      toast.error('Failed to delete');
    } finally {
      setTransactionToDelete(null);
    }
  };

  const contextValue = useMemo(() => ({
    openAddModal,
    openEditModal,
    openDeleteModal
  }), []);

  return (
    <TransactionsContext.Provider value={contextValue}>
      {children}
      
      <TransactionFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        editingTransaction={editingTransaction}
        customCategories={customCategories}
        addCustomCategory={addCustomCategory}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        description="Are you sure you want to remove this transaction record?"
      />
    </TransactionsContext.Provider>
  );
}

export function AddTransactionButton() {
  const { openAddModal } = useTransactionsPage();
  return (
    <Button
      onClick={openAddModal}
      className="w-full sm:w-auto bg-gradient-to-r from-brand-blue to-brand-accent text-white hover:brightness-110 shadow-xl shadow-brand-blue/30 px-6 sm:px-10 py-5 sm:py-7 rounded-xl sm:rounded-[20px] text-base sm:text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] group"
    >
      <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 group-hover:rotate-90 transition-transform duration-300" />
      Add Transaction
    </Button>
  );
}
