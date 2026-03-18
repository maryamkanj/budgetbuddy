import { useMemo } from 'react';
import { calculateFinancialSummary } from '@/lib/utils/financial';
import { Database } from '@/types/supabase';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type Salary = Database['public']['Tables']['salaries']['Row'];
type Goal = Database['public']['Tables']['goals']['Row'];

export function useFinancialSummary(transactions: Transaction[], salaries: Salary[], goals: Goal[]) {
  const summary = useMemo(() => calculateFinancialSummary(transactions), [transactions]);
  
  const salary = useMemo(() => (salaries.length > 0 ? salaries[0] : null), [salaries]);
  
  const currency = useMemo(() => salary?.currency || 'USD', [salary]);

  const activeGoalsCount = useMemo(() => 
    goals.filter(g => g.status === 'Active' && g.current_amount < g.target_amount).length, 
    [goals]
  );

  const avgTransactionAmount = useMemo(() => {
    if (transactions.length === 0) return 0;
    return transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
  }, [transactions]);

  return useMemo(
    () => ({
      summary,
      salary,
      currency,
      activeGoalsCount,
      avgTransactionAmount,
    }),
    [summary, salary, currency, activeGoalsCount, avgTransactionAmount]
  );
}
