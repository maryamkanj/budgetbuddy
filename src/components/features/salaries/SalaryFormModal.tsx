import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database } from '@/types/database';

type Salary = Database['public']['Tables']['salaries']['Row'];

const salarySchema = z.object({
  salary_name: z.string().min(1, "Nickname is required"),
  company_name: z.string().optional(),
  base_salary: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Base amount must be a positive number",
  }),
  currency: z.enum(['USD', 'LBP']),
});

type SalaryFormValues = z.infer<typeof salarySchema>;

interface SalaryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SalaryFormValues) => Promise<void>;
  editingSalary?: Salary | null;
}

export function SalaryFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingSalary,
}: SalaryFormModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SalaryFormValues>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      salary_name: '',
      company_name: '',
      base_salary: '',
      currency: 'USD',
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (editingSalary) {
      reset({
        salary_name: editingSalary.salary_name || '',
        company_name: editingSalary.company_name || '',
        base_salary: editingSalary.base_salary.toString(),
        currency: editingSalary.currency as 'USD' | 'LBP',
      });
    } else {
      reset({
        salary_name: '',
        company_name: '',
        base_salary: '',
        currency: 'USD',
      });
    }
  }, [editingSalary, isOpen, reset]);

  const onFormSubmit = async (values: SalaryFormValues) => {
    await onSubmit(values);
    onClose();
  };

  const watchCurrency = watch('currency');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md text-foreground">
        <DialogHeader>
          <DialogTitle>
            {editingSalary ? 'Edit Salary' : 'New Salary Profile'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salary_name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Salary Nickname</Label>
              <Input
                id="salary_name"
                {...register('salary_name')}
                placeholder="e.g., Primary Career"
              />
              {errors.salary_name && <p className="text-xs text-destructive">{errors.salary_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Company (Optional)</Label>
              <Input
                id="company_name"
                {...register('company_name')}
                placeholder="Acme Corp"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_salary" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Base Amount</Label>
                <Input
                  id="base_salary"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('base_salary')}
                  className="font-mono"
                />
                {errors.base_salary && <p className="text-xs text-destructive">{errors.base_salary.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Currency</Label>
                <Select 
                  value={watchCurrency} 
                  onValueChange={(value: 'USD' | 'LBP') => setValue('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="USD" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="LBP">LBP (LL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (editingSalary ? 'Save Changes' : 'Setup Profile')}
              </Button>
            </div>
          </form>
      </DialogContent>
    </Dialog>
  );
}

