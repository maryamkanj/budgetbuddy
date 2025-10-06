import { Transaction } from '@/types/transaction';
import { Goal } from '@/types/goal';
import { SalaryAllocation } from '@/types/salary';
import { convertToUSD } from './currency-utils';

export interface DashboardSummary {
  totalSpending: number;
  totalSaving: number;
  netAmount: number;
  spendingByCategory: { category: string; amount: number; percentage: number }[];
  weeklyTrends: { week: string; spending: number; saving: number }[];
}

function calculateWeeklyTrends(transactions: Transaction[]): { week: string; spending: number; saving: number }[] {
  const weeks: { [key: string]: { spending: number; saving: number } } = {};
  const now = new Date();
  
  // Initialize last 4 weeks
  for (let i = 3; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    const weekKey = `Week${4 - i}`;
    weeks[weekKey] = { spending: 0, saving: 0 };
  }

  // Aggregate transactions by week
  transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.date);
    const diffTime = Math.abs(now.getTime() - transactionDate.getTime());
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    if (diffWeeks <= 4) {
      const weekKey = `Week${diffWeeks}`;
      if (transaction.type === 'Spending') {
        weeks[weekKey].spending += transaction.amount;
      } else {
        weeks[weekKey].saving += transaction.amount;
      }
    }
  });

  return Object.entries(weeks).map(([week, data]) => ({
    week,
    spending: data.spending,
    saving: data.saving
  }));
}

export function calculateSummary(transactions: Transaction[] = [], currency: 'USD' | 'LBP' = 'USD'): DashboardSummary {
  // Convert all amounts to USD for consistent calculations
  const transactionsInUSD = transactions.map(tx => ({
    ...tx,
    amount: convertToUSD(tx.amount, tx.currency)
  }));

  if (transactionsInUSD.length === 0) {
    return {
      totalSpending: 0,
      totalSaving: 0,
      netAmount: 0,
      spendingByCategory: [],
      weeklyTrends: []
    };
  }

  // Calculate totals
  const totalSpending = transactionsInUSD
    .filter(t => t.type === 'Spending')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSaving = transactionsInUSD
    .filter(t => t.type === 'Saving')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalSaving - totalSpending;

  // Calculate spending by category
  const spendingByCategory: Record<string, number> = {};
  transactionsInUSD
    .filter(t => t.type === 'Spending' && t.category)
    .forEach(t => {
      spendingByCategory[t.category!] = (spendingByCategory[t.category!] || 0) + t.amount;
    });

  const totalSpendingForCategories = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0);
  
  const spendingByCategoryArray = Object.entries(spendingByCategory).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalSpendingForCategories > 0 ? (amount / totalSpendingForCategories) * 100 : 0
  }));

  // Calculate weekly trends (using transactions in USD)
  const weeklyTrends = calculateWeeklyTrends(transactionsInUSD);

  return {
    totalSpending,
    totalSaving,
    netAmount,
    spendingByCategory: spendingByCategoryArray,
    weeklyTrends
  };
}

export function calculateGoalProgress(goals: Goal[] = []): { active: number; completed: number; failed: number } {
  const active = goals.filter(g => g.status === 'Active').length;
  const completed = goals.filter(g => g.status === 'Completed').length;
  const failed = goals.filter(g => g.status === 'Failed').length;
  
  return { active, completed, failed };
}

export function checkSalaryAllocation(salary: number, allocations: SalaryAllocation[] = []): number {
  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
  return totalAllocated;
}