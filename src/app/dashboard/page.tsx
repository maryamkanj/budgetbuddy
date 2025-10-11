'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { localStorageService } from '@/lib/localStorage';
import { DashboardSummary, calculateSummary, calculateGoalProgress, checkSalaryAllocation } from '@/lib/dashboard-utils';
import { convertToUSD, formatCurrency } from '@/lib/currency-utils';
import { User } from '@/types/user';
import { Transaction } from '@/types/transaction';
import { Goal } from '@/types/goal';
import { Salary, SalaryAllocation } from '@/types/salary';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { TrendsChart } from '@/components/dashboard/trends-chart';
import { GoalsProgress } from '@/components/dashboard/goals-progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, PieChart, Target } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [salary, setSalary] = useState<Salary | null>(null);
  const [allocations, setAllocations] = useState<SalaryAllocation[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setUser(currentUser);
    loadUserData(currentUser.id);
  }, [router]);

  const loadUserData = (userId: string) => {
    try {
      const userTransactions = localStorageService.getTransactionsByUserId(userId);
      const userGoals = localStorageService.getGoalsByUserId(userId);
      const userSalary = localStorageService.getSalaryByUserId(userId);
      let userAllocations: SalaryAllocation[] = [];

      if (userSalary) {
        userAllocations = localStorageService.getAllocationsBySalaryId(userSalary.id);
      }

      setTransactions(userTransactions);
      setGoals(userGoals);
      setSalary(userSalary || null);
      setAllocations(userAllocations);

      // Calculate dashboard summary
      const dashboardSummary = calculateSummary(userTransactions, userSalary?.currency || 'USD');
      setSummary(dashboardSummary);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900">Loading your dashboard...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currency = salary?.currency || 'USD';
  const goalProgress = calculateGoalProgress(goals);
  const allocationPercentage = salary ? checkSalaryAllocation(salary.baseSalary, allocations) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user.name}! Here's your financial overview.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/transactions">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <SummaryCards
            totalSpending={summary.totalSpending}
            totalSaving={summary.totalSaving}
            netAmount={summary.netAmount}
            currency={currency}
            activeGoals={goalProgress.active}
          />
        )}

        {/* Charts and Goals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Spending by Category */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Spending by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary && <CategoryChart data={summary.spendingByCategory} currency={currency} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Weekly Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary && <TrendsChart data={summary.weeklyTrends} currency={currency} />}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Goals Progress */}
            <GoalsProgress goals={goals} />

            {/* Salary Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Salary Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {salary ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Monthly Salary</span>
                      <span className="text-lg font-bold">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: salary.currency === 'LBP' ? 'USD' : salary.currency,
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(salary.baseSalary)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Allocated</span>
                        <span>{allocationPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${allocationPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {allocationPercentage < 100 && (
                      <p className="text-xs text-yellow-600">
                        {100 - allocationPercentage}% of your salary is not allocated
                      </p>
                    )}

                    <Link href="/salaries">
                      <Button variant="outline" className="w-full">
                        Manage Salary
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <p className="text-gray-500 text-sm">
                      Set up your salary to start budget planning
                    </p>
                    <Link href="/salaries">
                      <Button className="w-full">
                        Set Salary
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}