import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useFeatureAccess } from '@/providers/SubscriptionProvider';
import Link from 'next/link';
import { CustomCategory, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_SAVING_CATEGORIES, DB_TRANSACTION_CATEGORIES } from '@/lib/actions/categoryConstants';
import { Database } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Transaction = Database['public']['Tables']['transactions']['Row'];

const transactionSchema = z.object({
  type: z.enum(['Spending', 'Saving']),
  currency: z.enum(['USD', 'LBP']),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
  note: z.string().optional(),
  customCategoryName: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editingTransaction: Transaction | null;
  customCategories: CustomCategory[];
  addCustomCategory: (name: string, type: 'expense' | 'saving' | 'allocation') => Promise<CustomCategory>;
}

export function TransactionFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingTransaction,
  customCategories,
  addCustomCategory,
}: TransactionFormModalProps) {
  const { hasCustomCategories } = useFeatureAccess();
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'Spending',
      currency: 'USD',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: DEFAULT_EXPENSE_CATEGORIES[0],
      note: '',
      customCategoryName: '',
    },
  });

  const watchType = watch('type');
  const watchCategory = watch('category');

  useEffect(() => {
    if (!isOpen) return;

    if (editingTransaction) {
      const categoryToSet = (editingTransaction.category === 'Other' && editingTransaction.user_category)
        ? editingTransaction.user_category
        : editingTransaction.category;

      reset({
        type: editingTransaction.type as 'Spending' | 'Saving',
        currency: editingTransaction.currency as 'USD' | 'LBP',
        amount: editingTransaction.amount.toString(),
        date: editingTransaction.date,
        category: categoryToSet,
        note: editingTransaction.note || '',
        customCategoryName: '',
      });
      setShowCustomCategory(false);
    } else {
      reset({
        type: 'Spending',
        currency: 'USD',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: DEFAULT_EXPENSE_CATEGORIES[0],
        note: '',
        customCategoryName: '',
      });
      setShowCustomCategory(false);
    }
  }, [editingTransaction, isOpen, reset]);

  // Adjust category when type changes
  useEffect(() => {
    if (!isOpen || editingTransaction) return;

    const currentList = watchType === 'Spending' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_SAVING_CATEGORIES;
    if (!currentList.includes(watchCategory) && !showCustomCategory) {
      setValue('category', currentList[0]);
    }
  }, [watchType, isOpen, editingTransaction, watchCategory, showCustomCategory, setValue]);

  const onFormSubmit = async (values: TransactionFormValues) => {
    setIsSubmitting(true);
    try {
      let finalCategory = showCustomCategory ? values.customCategoryName?.trim() : values.category;
      let userCategory: string | null = null;

      if (showCustomCategory && values.customCategoryName?.trim()) {
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

        const type = values.type === 'Spending' ? 'expense' : 'saving';
        const result = await addCustomCategory(values.customCategoryName.trim(), type);

        finalCategory = 'Other';
        userCategory = result.name;
      } else {
        const isSupportedByEnum = DB_TRANSACTION_CATEGORIES.includes(values.category as typeof DB_TRANSACTION_CATEGORIES[number]);
        if (!isSupportedByEnum) {
          userCategory = values.category;
          finalCategory = 'Other';
        }
      }

      if (!finalCategory) throw new Error("Category is required");

      const transactionData = {
        category: finalCategory as Transaction['category'],
        user_category: userCategory,
        amount: parseFloat(values.amount),
        currency: values.currency,
        type: values.type,
        note: values.note || null,
        date: values.date
      };

      onClose();
      await onSubmit(transactionData);
    } catch (error) {
      console.error('Error in modal submit:', error);
      toast.error('An error occurred while saving the transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Type</Label>
              <Select
                value={watchType}
                onValueChange={(value: 'Spending' | 'Saving') => {
                  setValue('type', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Spending">Spending</SelectItem>
                  <SelectItem value="Saving">Saving</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Currency</Label>
              <Select 
                value={watch('currency')} 
                onValueChange={(value: 'USD' | 'LBP') => setValue('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="LBP">LBP</SelectItem>
                </SelectContent>
              </Select>
              {errors.currency && <p className="text-xs text-destructive">{errors.currency.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Amount</Label>
              <div className="relative group">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('amount')}
                  className="font-mono font-bold"
                />
              </div>
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Date</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
            {showCustomCategory ? (
              <div className="flex gap-2">
                <Input
                  id="customCategoryName"
                  placeholder="Enter category name"
                  {...register('customCategoryName')}
                  className="flex-1"
                  autoFocus
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
                value={watchCategory}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(watchType === 'Spending' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_SAVING_CATEGORIES).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}

                  {customCategories
                    .filter(cat => cat.type === (watchType === 'Spending' ? 'expense' : 'saving'))
                    .map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))
                  }

                  <div className="border-t border-white/10 mt-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start text-xs transition-colors ${hasCustomCategories ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground opacity-70'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasCustomCategories) {
                          setShowCustomCategory(true);
                        } else {
                          toast.error(
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-base">Pro Feature</span>
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
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Note (Optional)</Label>
            <Input
              id="note"
              {...register('note')}
              placeholder="What was this for?"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {editingTransaction ? 'Discard' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingTransaction ? 'Save Changes' : 'Add Transaction')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

