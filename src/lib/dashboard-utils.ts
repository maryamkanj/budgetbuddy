import { Transaction } from '@/types/transaction';
import { Goal } from '@/types/goal';
import { SalaryAllocation } from '@/types/salary';

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
    
    if (diffWeeks > 0 && diffWeeks <= 4) {
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

export const dashboardUtils = {
  calculateSummary(transactions: Transaction[] = [], currency: 'USD' | 'LBP' = 'USD'): DashboardSummary {
    if (!transactions || transactions.length === 0) {
      return {
        totalSpending: 0,
        totalSaving: 0,
        netAmount: 0,
        spendingByCategory: [],
        weeklyTrends: []
      };
    }

    const filteredTransactions = transactions.filter(t => t.currency === currency);
    
    const totalSpending = filteredTransactions
      .filter(t => t.type === 'Spending')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSaving = filteredTransactions
      .filter(t => t.type === 'Saving')
      .reduce((sum, t) => sum + t.amount, 0);

    const netAmount = totalSaving - totalSpending;

    // Calculate spending by category
    const spendingTransactions = filteredTransactions.filter(t => t.type === 'Spending');
    const categoryMap = new Map<string, number>();
    
    spendingTransactions.forEach(transaction => {
      const category = transaction.category === 'Other' ? transaction.userCategory || 'Other' : transaction.category;
      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + transaction.amount);
    });

    const spendingByCategory = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0
    }));

    // Calculate weekly trends (last 4 weeks)
    const weeklyTrends = calculateWeeklyTrends(filteredTransactions);

    return {
      totalSpending,
      totalSaving,
      netAmount,
      spendingByCategory,
      weeklyTrends
    };
  },

  calculateGoalProgress(goals: Goal[]): { active: number; completed: number; failed: number } {
    const active = goals.filter(g => g.status === 'Active').length;
    const completed = goals.filter(g => g.status === 'Completed').length;
    const failed = goals.filter(g => g.status === 'Failed').length;
    
    return { active, completed, failed };
  },

  checkSalaryAllocation(salary: number, allocations: SalaryAllocation[]): number {
    const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
    return totalAllocated;
  }
};