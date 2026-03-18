import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database } from '@/types/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Goal = Database['public']['Tables']['goals']['Row'];

const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  target_amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Target amount must be a positive number",
  }),
  target_currency: z.enum(['USD', 'LBP']),
  current_amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Progress must be a zero or positive number",
  }),
  deadline: z.string().min(1, "Target date is required"),
});

type GoalFormValues = z.infer<typeof goalSchema>;

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editingGoal: Goal | null;
}

export function GoalFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingGoal,
}: GoalFormModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      target_amount: '',
      target_currency: 'USD',
      current_amount: '0',
      deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (editingGoal) {
      reset({
        title: editingGoal.title,
        target_amount: editingGoal.target_amount.toString(),
        target_currency: editingGoal.target_currency as 'USD' | 'LBP',
        current_amount: editingGoal.current_amount.toString(),
        deadline: editingGoal.deadline ? new Date(editingGoal.deadline).toISOString().split('T')[0] : '',
      });
    } else {
      reset({
        title: '',
        target_amount: '',
        target_currency: 'USD',
        current_amount: '0',
        deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      });
    }
  }, [editingGoal, isOpen, reset]);

  const onFormSubmit = async (values: GoalFormValues) => {
    try {
      const current = parseFloat(values.current_amount || '0');
      const target = parseFloat(values.target_amount);
      
      let newStatus = editingGoal?.status || 'Active';
      if (current >= target) {
        newStatus = 'Completed';
      } else if (newStatus === 'Completed' && current < target) {
        newStatus = 'Active';
      }

      const goalData = {
        title: values.title,
        target_amount: target,
        target_currency: values.target_currency,
        current_amount: current,
        deadline: values.deadline,
        status: newStatus
      };

      onClose();
      await onSubmit(goalData as Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
    } catch (error) {
      console.error('Error in modal submit:', error);
    }
  };

  const watchCurrency = watch('target_currency');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md text-foreground">
        <DialogHeader>
          <DialogTitle>
            {editingGoal ? 'Edit Goal' : 'New Goal'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Goal Title</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g., Emergency Fund, New Car"
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="target_amount" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Target Amount</Label>
                <Input
                  id="target_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('target_amount')}
                  className="font-mono font-bold text-lg"
                />
                {errors.target_amount && <p className="text-xs text-destructive">{errors.target_amount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_currency" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Currency</Label>
                <Select 
                  value={watchCurrency} 
                  onValueChange={(value: 'USD' | 'LBP') => setValue('target_currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="LBP">LBP</SelectItem>
                  </SelectContent>
                </Select>
                {errors.target_currency && <p className="text-xs text-destructive">{errors.target_currency.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="current_amount" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Current Progress</Label>
                <Input
                  id="current_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('current_amount')}
                  className="font-mono text-lg"
                />
                {errors.current_amount && <p className="text-xs text-destructive">{errors.current_amount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Target Date</Label>
                <Input
                  id="deadline"
                  type="date"
                  {...register('deadline')}
                />
                {errors.deadline && <p className="text-xs text-destructive">{errors.deadline.message}</p>}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {editingGoal ? 'Discard' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (editingGoal ? 'Save Changes' : 'Create Goal')}
              </Button>
            </div>
          </form>
      </DialogContent>
    </Dialog>
  );
}

