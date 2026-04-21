'use client';

import { Database } from '@/types/database';

import { useState, useEffect } from 'react';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import { SummaryCards } from '@/components/features/dashboard/SummaryCards';
import { CategoryChart } from '@/components/features/dashboard/CategoryChart';
import { TrendsChart } from '@/components/features/dashboard/TrendsChart';
import { GoalsProgress } from '@/components/features/dashboard/GoalsProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, PiggyBank, CreditCard, Edit, Trash2, PieChart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/financial';
import Link from 'next/link';
import { TierBadge } from '@/components/features/saas/BadgeTier';
import { TransactionUsageMeter, GoalUsageMeter, SalaryUsageMeter } from '@/components/features/saas/UsageMeter';
import { useSubscription, useUsageLimits } from '@/providers/SubscriptionProvider';
import { useTransactions } from '@/providers/TransactionProvider';
import { useGoals } from '@/providers/GoalProvider';
import { useSalaries } from '@/providers/SalaryProvider';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { LoadingPage } from '@/components/common/LoadingSpinner';

interface DashboardClientProps {
  initialTransactions?: Database['public']['Tables']['transactions']['Row'][];
  initialGoals?: Database['public']['Tables']['goals']['Row'][];
  initialSalaries?: Database['public']['Tables']['salaries']['Row'][];
  initialAllocations?: Database['public']['Tables']['salary_allocations']['Row'][];
}

export function DashboardClient({
  initialTransactions = [],
  initialGoals = [],
  initialSalaries = [],
  initialAllocations = []
}: DashboardClientProps) {
  const {
    transactions: ctxTransactions,
    deleteTransaction,
    loading: txLoading,
    initializeTransactions
  } = useTransactions();
  const { goals: ctxGoals, initializeGoals } = useGoals();
  const { salaries: ctxSalaries, initializeSalaries } = useSalaries();

  const { tier } = useSubscription();
  const usageLimits = useUsageLimits();

  const [initialized, setInitialized] = useState(false);

  // Sync server data to context
  useEffect(() => {
    if (!initialized) {
      if (initialTransactions.length > 0) initializeTransactions(initialTransactions, false);
      if (initialGoals.length > 0) initializeGoals(initialGoals);
      if (initialSalaries.length > 0) initializeSalaries(initialSalaries, initialAllocations);
      setInitialized(true);
    }
  }, [initialTransactions, initialGoals, initialSalaries, initialAllocations, initializeTransactions, initializeGoals, initializeSalaries, initialized]);

  const transactions = initialized ? ctxTransactions : initialTransactions;
  const goals = initialized ? ctxGoals : initialGoals;
  const salaries = initialized ? ctxSalaries : initialSalaries;

  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { summary, salary, currency, activeGoalsCount, avgTransactionAmount } = useFinancialSummary(transactions, salaries, goals);

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      await deleteTransaction(transactionToDelete);
      toast.success('Transaction deleted');
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete transaction');
    }
  };

  if (txLoading && !transactions.length) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-8">
      <SummaryCards
        totalSpending={summary.totalSpending}
        totalSaving={summary.totalSaving}
        netAmount={summary.netAmount}
        currency={currency}
        activeGoals={activeGoalsCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Spending by Category</h3>
              <CategoryChart data={summary.spendingByCategory} currency={currency} />
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Financial Trends</h3>
              <TrendsChart data={summary.weeklyTrends} currency={currency} />
            </div>
          </div>

          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Recent Transactions
              </CardTitle>
              <Link href="/transactions" className="text-sm text-primary hover:underline font-medium">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="group flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/5 hover:translate-x-1"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full transition-colors ${transaction.type === 'Saving' ? 'bg-brand-success/10 text-brand-success' : 'bg-muted text-muted-foreground group-hover:bg-destructive/10 group-hover:text-destructive'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {transaction.category === 'Other' ? (transaction.user_category || 'Other') : transaction.category}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {transaction.note || transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`font-mono font-bold text-sm ${transaction.type === 'Saving' ? 'text-brand-success' : 'text-foreground'}`}>
                          {transaction.type === 'Saving' ? '+' : '-'}
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/transactions?edit=${transaction.id}`} className={transaction.id.startsWith('temp-') ? 'pointer-events-none' : ''}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={transaction.id.startsWith('temp-')}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={() => handleDeleteClick(transaction.id)}
                          disabled={transaction.id.startsWith('temp-')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {transactions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions yet. <Link href="/transactions" className="text-primary hover:underline">Add your first transaction</Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <GoalsProgress goals={goals} />

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Financial Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Transactions</span>
                  <span className="font-bold">{transactions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Goals</span>
                  <span className="font-bold">{activeGoalsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Transaction</span>
                  <span className="font-mono font-bold">
                    {formatCurrency(avgTransactionAmount, currency as "USD" | "LBP")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-primary" />
                Budget Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Monthly Budget</span>
                    <span className="font-bold">
                      {salary ?
                        `${salary.salary_name || 'Salary'}${salary.company_name ? ` • ${salary.company_name}` : ''}` :
                        'Not Set'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Spent</span>
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(summary.totalSpending, currency as "USD" | "LBP")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className="font-mono font-bold text-primary">
                      {salary ? formatCurrency(salary.base_salary - summary.totalSpending, salary.currency) : 'N/A'}
                    </span>
                  </div>
                </div>
                {salary && (
                  <div className="w-full bg-muted rounded-full h-2 relative overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-in-out",
                        (summary.totalSpending / salary.base_salary) > 0.9 ? "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.3)]" :
                        (summary.totalSpending / salary.base_salary) > 0.7 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" :
                        "bg-primary shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                      )}
                      style={{ width: `${Math.min((summary.totalSpending / salary.base_salary) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-primary" />
                Salary Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {salary ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">Monthly Salary</span>
                    <span className="font-mono text-lg font-bold text-foreground">
                      {formatCurrency(salary.base_salary, salary.currency)}
                    </span>
                  </div>
                  <Link href="/salaries" className="w-full">
                    <Button variant="outline" className="w-full h-11 rounded-xl border-border hover:bg-white/5 font-semibold text-xs uppercase tracking-widest transition-all">
                      Manage Salary
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <p className="text-muted-foreground text-sm">
                    Set up your salary to start budget planning
                  </p>
                  <Link href="/salaries" className="w-full">
                    <Button className="w-full bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl px-8 h-11 font-bold text-sm tracking-tight transition-all hover:translate-y-[-1px] active:translate-y-[0px] hover:shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-2 group">
                      Set Salary
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Plan Usage
                </div>
                <TierBadge tier={tier} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <TransactionUsageMeter current={usageLimits.transactions.current} />
              <GoalUsageMeter current={usageLimits.goals.current} />
              <SalaryUsageMeter current={usageLimits.salaries.current} />
            </CardContent>
          </Card>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTransactionToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </div>
  );
}
