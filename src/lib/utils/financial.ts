import { Database } from '@/types/database';

export const DEFAULT_EXCHANGE_RATE = 89699.58;

export const convertToUSD = (amount: number, currency: 'USD' | 'LBP', rate: number = DEFAULT_EXCHANGE_RATE): number => {
  if (currency === 'LBP') {
    return amount / rate;
  }
  return amount;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat(currency === 'LBP' ? 'en-LB' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

type Transaction = Database['public']['Tables']['transactions']['Row'];
type Goal = Database['public']['Tables']['goals']['Row'];
type Salary = Database['public']['Tables']['salaries']['Row'];
type SalaryAllocation = Database['public']['Tables']['salary_allocations']['Row'];

export interface FinancialSummary {
  totalSpending: number;
  totalSaving: number;
  netAmount: number;
  spendingByCategory: { category: string; amount: number; percentage: number }[];
  weeklyTrends: { week: string; spending: number; saving: number }[];
  averageDailySpending: number;
  biggestExpenseCategory: string;
  savingsRate: number;
}

export interface GoalProgress {
  active: number;
  completed: number;
  failed: number;
  totalSaved: number;
  totalTarget: number;
  overallProgress: number;
}

export interface SalaryAnalysis {
  totalSalary: number;
  totalAllocated: number;
  allocationPercentage: number;
  unallocatedAmount: number;
  allocationsByCategory: { category: string; amount: number; percentage: number }[];
}

export function calculateFinancialSummary(transactions: Transaction[]): FinancialSummary {
  const transactionsInUSD = transactions.map(tx => ({
    ...tx,
    amount: convertToUSD(tx.amount || 0, (tx.currency as 'USD' | 'LBP') || 'USD')
  }));

  if (transactionsInUSD.length === 0) {
    return {
      totalSpending: 0,
      totalSaving: 0,
      netAmount: 0,
      spendingByCategory: [],
      weeklyTrends: [],
      averageDailySpending: 0,
      biggestExpenseCategory: '',
      savingsRate: 0
    };
  }

  const spendingTransactions = transactionsInUSD.filter(t => t.type === 'Spending');
  const savingTransactions = transactionsInUSD.filter(t => t.type === 'Saving');

  const totalSpending = spendingTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalSaving = savingTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const netAmount = totalSaving - totalSpending;

  const spendingByCategoryMap = new Map<string, number>();
  spendingTransactions.forEach(t => {
    const category = (t.category === 'Other' && t.user_category) ? t.user_category : (t.category || 'Other');
    const current = spendingByCategoryMap.get(category) || 0;
    spendingByCategoryMap.set(category, current + (t.amount || 0));
  });

  const spendingByCategory = Array.from(spendingByCategoryMap.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0
  })).sort((a, b) => b.amount - a.amount);

  const weeklyTrends = calculateWeeklyTrends(transactionsInUSD);

  const daysWithTransactions = new Set(transactionsInUSD.map(t => t.date?.split('T')[0])).size;
  const averageDailySpending = daysWithTransactions > 0 ? totalSpending / daysWithTransactions : 0;
  const biggestExpenseCategory = spendingByCategory[0]?.category || '';
  const totalIncome = totalSpending + totalSaving;
  const savingsRate = totalIncome > 0 ? (totalSaving / totalIncome) * 100 : 0;

  return {
    totalSpending,
    totalSaving,
    netAmount,
    spendingByCategory,
    weeklyTrends,
    averageDailySpending,
    biggestExpenseCategory,
    savingsRate
  };
}

function calculateWeeklyTrends(transactions: (Transaction & { amount: number })[]): { week: string; spending: number; saving: number }[] {
  const weeks: { [key: string]: { spending: number; saving: number } } = {};
  const now = new Date();

  for (let i = 3; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    const weekKey = `Week ${4 - i}`;
    weeks[weekKey] = { spending: 0, saving: 0 };
  }

  transactions.forEach(transaction => {
    if (!transaction.date) return;
    const transactionDate = new Date(transaction.date);
    const diffTime = Math.abs(now.getTime() - transactionDate.getTime());
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

    if (diffWeeks <= 4) {
      const weekKey = `Week ${5 - diffWeeks}`;
      if (weeks[weekKey]) {
        if (transaction.type === 'Spending') {
          weeks[weekKey].spending += (transaction.amount || 0);
        } else {
          weeks[weekKey].saving += (transaction.amount || 0);
        }
      }
    }
  });

  return Object.entries(weeks).map(([week, data]) => ({
    week,
    spending: data.spending,
    saving: data.saving
  }));
}

export function calculateGoalProgress(goals: Goal[], exchangeRate: number = DEFAULT_EXCHANGE_RATE): GoalProgress {
  const active = goals.filter(g => g.status === 'Active').length;
  const completed = goals.filter(g => g.status === 'Completed').length;
  const failed = goals.filter(g => g.status === 'Failed').length;

  const totalSaved = goals.reduce((sum, g) => sum + convertToUSD(g.current_amount || 0, g.target_currency || 'USD', exchangeRate), 0);
  const totalTarget = goals.reduce((sum, g) => sum + convertToUSD(g.target_amount || 0, g.target_currency || 'USD', exchangeRate), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return {
    active,
    completed,
    failed,
    totalSaved,
    totalTarget,
    overallProgress
  };
}

export function analyzeSalary(salary: Salary, allocations: SalaryAllocation[], exchangeRate: number = DEFAULT_EXCHANGE_RATE): SalaryAnalysis {
  const totalSalary = convertToUSD(salary.base_salary || 0, (salary.currency as 'USD' | 'LBP') || 'USD', exchangeRate);
  const totalAllocated = allocations.reduce((sum, alloc) => sum + (alloc.allocated_amount || 0), 0);
  const allocationPercentage = totalSalary > 0 ? (totalAllocated / totalSalary) * 100 : 0;
  const unallocatedAmount = totalSalary - totalAllocated;

  const allocationsByCategory = allocations.map(alloc => ({
    category: alloc.category || 'Uncategorized',
    amount: alloc.allocated_amount || 0,
    percentage: totalAllocated > 0 ? ((alloc.allocated_amount || 0) / totalAllocated) * 100 : 0
  }));

  return {
    totalSalary,
    totalAllocated,
    allocationPercentage,
    unallocatedAmount,
    allocationsByCategory
  };
}

export function analyzeBudgetPerformance(
  transactions: Transaction[],
  salary: Salary,
  allocations: SalaryAllocation[],
  exchangeRate: number = DEFAULT_EXCHANGE_RATE
): {
  isOverBudget: boolean;
  overspentCategories: string[];
  remainingBudget: number;
  budgetUtilization: number;
} {
  const financialSummary = calculateFinancialSummary(transactions);
  const salaryAnalysis = analyzeSalary(salary, allocations, exchangeRate);

  const totalBudget = salaryAnalysis.totalAllocated;
  const actualSpending = financialSummary.totalSpending;
  const remainingBudget = totalBudget - actualSpending;
  const budgetUtilization = totalBudget > 0 ? (actualSpending / totalBudget) * 100 : 0;

  const overspentCategories = allocations
    .filter(alloc => {
      const actualSpendingEntry = financialSummary.spendingByCategory.find(s => s.category === alloc.category);
      const actualSpending = actualSpendingEntry?.amount || 0;
      return actualSpending > (alloc.allocated_amount || 0);
    })
    .map(alloc => alloc.category || 'Other');

  const isOverBudget = actualSpending > totalBudget;

  return {
    isOverBudget,
    overspentCategories,
    remainingBudget,
    budgetUtilization
  };
}

export function calculateFinancialHealthScore(
  summary: FinancialSummary,
  goalProgress: GoalProgress,
  budgetPerformance: { isOverBudget: boolean; budgetUtilization: number }
): {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    savingsRate: number;
    budgetAdherence: number;
    goalProgress: number;
    spendingConsistency: number;
  };
} {
  const savingsRateScore = Math.min(summary.savingsRate / 20 * 100, 100);

  let budgetAdherenceScore = 100;
  if (budgetPerformance.isOverBudget) {
    budgetAdherenceScore = Math.max(0, 100 - (budgetPerformance.budgetUtilization - 100) * 2);
  }

  const goalProgressScore = goalProgress.overallProgress;

  const spendingConsistencyScore = summary.averageDailySpending > 0
    ? Math.min(100, 50 / summary.averageDailySpending * 100)
    : 100;

  const factors = {
    savingsRate: savingsRateScore,
    budgetAdherence: budgetAdherenceScore,
    goalProgress: goalProgressScore,
    spendingConsistency: spendingConsistencyScore
  };

  const score = (
    savingsRateScore * 0.4 +
    budgetAdherenceScore * 0.3 +
    goalProgressScore * 0.2 +
    spendingConsistencyScore * 0.1
  );

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return { score, grade, factors };
}
