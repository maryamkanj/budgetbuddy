'use client';

import { useState, useMemo } from 'react';
import { useSupabaseAuth } from '@/providers/SupabaseAuthProvider';
import { Database } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Target,
  PieChart,
  BarChart3,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/financial';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatCard } from '@/components/ui/statCard';
import { useRouter, useSearchParams } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Goal = Database['public']['Tables']['goals']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

interface MonthlyReport {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

interface CategoryTrend {
  category: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

interface ReportsClientProps {
  initialTransactions: Transaction[];
  initialGoals: Goal[];
  year: string;
}

export function ReportsClient({ initialTransactions, initialGoals, year }: ReportsClientProps) {
  const { userProfile } = useSupabaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedYear, setSelectedYear] = useState(year);

  const handleYearChange = (newYear: string) => {
    setSelectedYear(newYear);
    const params = new URLSearchParams(searchParams);
    params.set('year', newYear);
    router.push(`/reports?${params.toString()}`);
  };

  const transactions = initialTransactions;
  const goals = initialGoals;

  const monthlyReports = useMemo((): MonthlyReport[] => {
    const reports: MonthlyReport[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 12; i++) {
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === i && date.getFullYear().toString() === selectedYear;
      });

      const income = monthTransactions
        .filter((t: Transaction) => t.type === 'Saving')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t: Transaction) => t.type === 'Spending')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      const savings = income - expenses;
      const savingsRate = income > 0 ? (savings / income) * 100 : 0;

      reports.push({
        month: months[i],
        income,
        expenses,
        savings,
        savingsRate
      });
    }

    return reports;
  }, [transactions, selectedYear]);

  const categoryTrends = useMemo((): CategoryTrend[] => {
    const categories = Array.from(new Set(transactions.map((t: Transaction) => t.category)));

    return categories.map((category: string) => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = parseInt(selectedYear);

      const currentTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return t.category === category &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear;
      });

      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const previousTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return t.category === category &&
          date.getMonth() === previousMonth &&
          date.getFullYear() === previousYear;
      });

      const current = currentTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      const previous = previousTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      const change = current - previous;
      const changePercent = previous > 0 ? (change / previous) * 100 : 0;

      return {
        category,
        current,
        previous,
        change,
        changePercent
      };
    }).sort((a, b) => b.current - a.current);
  }, [transactions, selectedYear]);

  const yearlySummary = useMemo(() => {
    const yearTransactions = transactions.filter(t => {
      return new Date(t.date).getFullYear().toString() === selectedYear;
    });

    const income = yearTransactions
      .filter((t: Transaction) => t.type === 'Saving')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const expenses = yearTransactions
      .filter((t: Transaction) => t.type === 'Spending')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    const completedGoals = goals.filter((g: Goal) =>
      g.status === 'Completed' &&
      new Date(g.deadline || '').getFullYear().toString() === selectedYear
    ).length;

    return { income, expenses, savings, savingsRate, completedGoals };
  }, [transactions, goals, selectedYear]);

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportMonthlyCSV = () => {
    const headers = ['Month', 'Income (USD)', 'Expenses (USD)', 'Savings (USD)', 'Savings Rate (%)'];
    const rows = monthlyReports.map(r => [
      r.month,
      r.income.toString(),
      r.expenses.toString(),
      r.savings.toString(),
      r.savingsRate.toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    downloadFile(csvContent, `monthly-report-${selectedYear}.csv`, 'text/csv');
    toast.success('Monthly report exported as CSV');
  };

  const exportCategoryCSV = () => {
    const headers = ['Category', 'Current Period (USD)', 'Previous Period (USD)', 'Change (USD)', 'Change (%)'];
    const rows = categoryTrends.map(t => [
      t.category,
      t.current.toString(),
      t.previous.toString(),
      t.change.toString(),
      t.changePercent.toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    downloadFile(csvContent, `category-analysis-${selectedYear}.csv`, 'text/csv');
    toast.success('Category analysis exported as CSV');
  };

  const exportAnnualPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text(`Annual Financial Summary - ${selectedYear}`, 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`User: ${userProfile?.name || 'BudgetBuddy User'}`, 14, 30);
    doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 35);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Performance Summary', 14, 48);

    doc.setFontSize(11);
    doc.text(`Total Annual Income: ${formatCurrency(yearlySummary.income, 'USD')}`, 14, 56);
    doc.text(`Total Annual Expenses: ${formatCurrency(yearlySummary.expenses, 'USD')}`, 14, 62);
    doc.text(`Net Annual Savings: ${formatCurrency(yearlySummary.savings, 'USD')}`, 14, 68);
    doc.text(`Overall Savings Rate: ${yearlySummary.savingsRate.toFixed(1)}%`, 14, 74);
    doc.text(`Financial Goals Completed: ${yearlySummary.completedGoals}`, 14, 80);

    doc.setFontSize(14);
    doc.text('Monthly Breakdown', 14, 95);

    autoTable(doc, {
      startY: 100,
      head: [['Month', 'Income', 'Expenses', 'Savings', 'Rate']],
      body: monthlyReports.map(r => [
        r.month,
        formatCurrency(r.income, 'USD'),
        formatCurrency(r.expenses, 'USD'),
        formatCurrency(r.savings, 'USD'),
        `${r.savingsRate.toFixed(1)}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [126, 34, 206] },
    });

    doc.save(`budgetbuddy-annual-summary-${selectedYear}.pdf`);
    toast.success('Annual summary exported as PDF');
  };

  return (
    <div className="min-h-screen bg-background">
      <PageContainer>
        <PageHeader
          title="Reports & Insights"
          description={`Comprehensive financial reports and analytics for ${selectedYear}`}
          action={
            <div className="flex gap-2 flex-wrap sm:justify-end">
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className="w-32 bg-background border-border h-11 rounded-xl">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border rounded-xl">
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportMonthlyCSV} className="h-11 rounded-xl border-border">
                <Download className="h-4 w-4 mr-2 text-primary" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={exportAnnualPDF} className="h-11 rounded-xl border-border">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                Export PDF
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <StatCard
            title="Total Income"
            value={formatCurrency(yearlySummary.income, 'USD')}
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBgColor="bg-green-600/10"
          />

          <StatCard
            title="Total Expenses"
            value={formatCurrency(yearlySummary.expenses, 'USD')}
            icon={TrendingDown}
            iconColor="text-red-600"
            iconBgColor="bg-red-600/10"
          />

          <StatCard
            title="Net Savings"
            value={formatCurrency(yearlySummary.savings, 'USD')}
            icon={DollarSign}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
            trend={{
              value: yearlySummary.savings >= 0 ? 'SAVED' : 'OVERSPENT',
              isPositive: yearlySummary.savings >= 0
            }}
          />

          <StatCard
            title="Savings Rate"
            value={`${yearlySummary.savingsRate.toFixed(1)}%`}
            icon={Target}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-600/10"
          />

          <StatCard
            title="Goals Achieved"
            value={yearlySummary.completedGoals}
            icon={Target}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-600/10"
          />
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Monthly Breakdown
            </CardTitle>
            <CardDescription>
              Month-by-month income, expenses, and savings analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyReports.map((report) => (
                <div key={report.month} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-medium text-sm w-12">{report.month}</span>
                      <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Income: </span>
                          <span className="font-medium text-green-600">{formatCurrency(report.income, 'USD')}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expenses: </span>
                          <span className="font-medium text-red-600">{formatCurrency(report.expenses, 'USD')}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Savings: </span>
                          <span className={`font-medium ${report.savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(report.savings, 'USD')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-12">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <Progress
                          value={Math.max(0, Math.min(100, report.savingsRate))}
                          className="h-2"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {report.savingsRate.toFixed(1)}% savings rate
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Category Trends
              </CardTitle>
              <CardDescription>
                Month-over-month spending changes by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryTrends.slice(0, 8).map((trend) => (
                  <div key={trend.category} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{trend.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(trend.current, 'USD')}
                          </span>
                          <div className={`flex items-center gap-1 text-xs ${trend.change > 0 ? 'text-red-600' :
                            trend.change < 0 ? 'text-green-600' : 'text-gray-600'
                            }`}>
                            {trend.change > 0 ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : trend.change < 0 ? (
                              <ArrowDownRight className="h-3 w-3" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                            {Math.abs(trend.changePercent).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.abs(trend.changePercent) * 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Goal Achievement
              </CardTitle>
              <CardDescription>
                Progress tracking for your financial goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.filter((g: Goal) => new Date(g.deadline || '').getFullYear().toString() === selectedYear).map((goal: Goal) => {
                  const progress = (goal.current_amount / goal.target_amount) * 100;
                  const isCompleted = goal.status === 'Completed';

                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{goal.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Target: {formatCurrency(goal.target_amount, 'USD')} •
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={isCompleted ? "default" : "secondary"} className="text-xs">
                            {isCompleted ? "Completed" : "In Progress"}
                          </Badge>
                          <p className="text-sm font-medium mt-1">{progress.toFixed(1)}%</p>
                        </div>
                      </div>
                      <Progress value={Math.min(100, progress)} className="h-2" />
                    </div>
                  );
                })}
                {goals.filter((g: Goal) => new Date(g.deadline || '').getFullYear().toString() === selectedYear).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No goals set for {selectedYear}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Export Options
            </CardTitle>
            <CardDescription>
              Download your financial data in various formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col" onClick={exportMonthlyCSV}>
                <Download className="h-6 w-6 mb-2" />
                <span>Monthly Report (CSV)</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={exportAnnualPDF}>
                <FileText className="h-6 w-6 mb-2" />
                <span>Annual Summary (PDF)</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={exportCategoryCSV}>
                <PieChart className="h-6 w-6 mb-2" />
                <span>Category Analysis (CSV)</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
