'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { useTransactions } from '@/providers/TransactionProvider';
import { convertToUSD, formatCurrency } from '@/lib/utils/financial';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FinancialNumber } from '@/components/ui/financialNumber';
import { StatCard } from '@/components/ui/statCard';
import { Search, Filter, TrendingDown, TrendingUp, DollarSign, Database as DatabaseIcon, Calendar, Edit, Trash2 } from 'lucide-react';
import { useTransactionsPage } from '@/features/transactions/components/TransactionsClient';
import { Database } from '@/types/supabase';
import { LoadingPage } from '@/components/ui/loadingSpinner';

type Transaction = Database['public']['Tables']['transactions']['Row'];

export function TransactionsList({ 
  initialTransactions = [], 
  initialHasMore = false 
}: { 
  initialTransactions?: Transaction[], 
  initialHasMore?: boolean 
}) {
  const {
    transactions: ctxTransactions,
    fetchMoreTransactions,
    hasMoreTransactions: ctxHasMore,
    isFetchingMore,
    loading,
    initializeTransactions
  } = useTransactions();

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializeTransactions(initialTransactions, initialHasMore);
      initializedRef.current = true;
    }
  }, [initialTransactions, initialHasMore, initializeTransactions]);

  const transactions = initializedRef.current ? ctxTransactions : initialTransactions;
  const hasMoreTransactions = initializedRef.current ? ctxHasMore : initialHasMore;

  const { openEditModal, openDeleteModal } = useTransactionsPage();

  const [filter, setFilter] = useState<'all' | 'Spending' | 'Saving'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesFilter = filter === 'all' || transaction.type === filter;
      const matchesSearch = searchTerm === '' ||
        transaction.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.user_category?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      return matchesFilter && matchesSearch;
    });
  }, [transactions, filter, searchTerm]);

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    filteredTransactions.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [filteredTransactions]);

  const stats = useMemo(() => {
    const spending = transactions
      .filter(t => t.type === 'Spending')
      .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);
    const saving = transactions
      .filter(t => t.type === 'Saving')
      .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);
    return { spending, saving, net: saving - spending };
  }, [transactions]);

  if (loading && !transactions.length) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Monthly Spending"
          value={<FinancialNumber amount={-Math.abs(stats.spending)} currency="USD" showSign={false} />}
          icon={TrendingDown}
          iconColor="text-destructive"
          iconBgColor="bg-destructive/10"
          description="THIS MONTH"
        />

        <StatCard
          title="Monthly Savings"
          value={<FinancialNumber amount={stats.saving} currency="USD" />}
          icon={TrendingUp}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
          description="THIS MONTH"
        />

        <StatCard
          title="Net Position"
          value={<FinancialNumber amount={stats.net} currency="USD" />}
          icon={DollarSign}
          iconColor="text-accent"
          iconBgColor="bg-accent/10"
          trend={{
            value: stats.net >= 0 ? 'SAVED' : 'OVERSPENT',
            isPositive: stats.net >= 0,
            label: 'DIFFERENCE'
          }}
        />

        <StatCard
          title="Total Activity"
          value={transactions.length}
          icon={DatabaseIcon}
          iconColor="text-accent"
          iconBgColor="bg-accent/10"
          description="All logged entries"
        />
      </div>


      <div className="flex flex-col md:flex-row gap-4 bg-card/40 p-3 sm:p-4 rounded-xl border border-border backdrop-blur-xl shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search note, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 sm:pl-16 bg-transparent border-none text-base sm:text-lg h-12 sm:h-14 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-medium"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-64">
            <Select value={filter} onValueChange={(value: 'all' | 'Spending' | 'Saving') => setFilter(value)}>
              <SelectTrigger className="bg-white/5 border-border h-14 rounded-xl focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all hover:bg-white/10 px-6 font-semibold">
                <div className="flex items-center gap-3">
                  <Filter className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-brand-dark border-border text-foreground rounded-xl shadow-2xl p-2">
                <SelectItem value="all" className="rounded-lg py-3 cursor-pointer">All History</SelectItem>
                <SelectItem value="Spending" className="rounded-lg py-3 cursor-pointer">Spending Only</SelectItem>
                <SelectItem value="Saving" className="rounded-lg py-3 cursor-pointer">Savings Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-8 pb-20">
        {groupedTransactions.length === 0 ? (
          <Card className="bg-card/20 border-2 border-dashed border-border p-12 sm:p-24 text-center rounded-xl backdrop-blur-sm group">
            <div className="flex flex-col items-center gap-6">
              <div className="p-8 bg-white/5 rounded-2xl ring-1 ring-border group-hover:scale-110 transition-transform duration-500 shadow-xl">
                <Calendar className="h-12 w-12 text-muted-foreground opacity-20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white tracking-tight">No transactions found</h3>
                <p className="text-muted-foreground text-base max-w-sm mx-auto font-medium opacity-60">
                  We couldn&apos;t find any transactions matching your current filters.
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-primary hover:bg-primary/10 font-bold px-8 py-6 rounded-xl text-lg transition-all"
                onClick={() => { setFilter('all'); setSearchTerm(''); }}
              >
                Reset all filters
              </Button>
            </div>
          </Card>
        ) : (
          groupedTransactions.map(([date, dateTransactions]) => (
            <div key={date} className="space-y-8">
              <div className="flex items-center gap-2 sm:gap-8 sticky top-12 z-20 py-4 pointer-events-none">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <Badge variant="outline" className="bg-brand-dark/80 border-white/10 py-2 px-4 sm:py-3 sm:px-8 text-muted-foreground font-mono text-[10px] sm:text-sm uppercase tracking-[0.1em] sm:tracking-[0.2em] shadow-2xl backdrop-blur-2xl pointer-events-auto rounded-full ring-1 ring-white/5 whitespace-nowrap">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </Badge>
                <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {dateTransactions.map((transaction) => (
                  <Card
                    key={transaction.id}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-6 border-border shadow-sm hover:shadow-md transition-all duration-300 gap-4 md:gap-6"
                  >
                    <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                      <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 shadow-sm ${transaction.type === 'Spending'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-primary/10 text-primary'
                        }`}>
                        {transaction.type === 'Spending' ? <TrendingDown className="h-6 w-6 sm:h-7 sm:w-7" /> : <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7" />}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-bold text-lg sm:text-xl text-foreground truncate tracking-tight">
                          {transaction.category === 'Other' ? (transaction.user_category || 'Other') : transaction.category}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <Badge variant="outline" className={`h-5 text-[10px] uppercase tracking-widest px-2 font-bold whitespace-nowrap ${transaction.type === 'Spending' ? 'bg-destructive/10 text-destructive border-none' : 'bg-primary/10 text-primary border-none'
                            }`}>
                            {transaction.type}
                          </Badge>
                          {transaction.note && (
                            <span className="truncate opacity-70 italic">
                              &quot;{transaction.note}&quot;
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row items-center justify-between md:justify-end gap-4 sm:gap-10">
                      <div className="text-left sm:text-right min-w-0 sm:min-w-32">
                        <p className={`font-mono font-bold text-lg sm:text-2xl tracking-tighter ${transaction.type === 'Spending' ? 'text-foreground' : 'text-primary'
                          }`}>
                          {transaction.type === 'Spending' ? '-' : '+'}{formatCurrency(transaction.amount, transaction.currency as 'USD' | 'LBP')}
                        </p>
                        {transaction.currency === 'LBP' && (
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground font-mono opacity-60 uppercase tracking-widest mt-0.5">
                            ≈ {formatCurrency(convertToUSD(transaction.amount, 'LBP'), 'USD')}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(transaction)}
                          disabled={transaction.id.startsWith('temp-')}
                          className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(transaction.id)}
                          disabled={transaction.id.startsWith('temp-')}
                          className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}

        {hasMoreTransactions && (
          <div className="flex justify-center pt-16">
            <Button
              variant="outline"
              onClick={fetchMoreTransactions}
              disabled={isFetchingMore}
              className="w-full sm:w-auto px-8 sm:px-16 py-5 sm:py-8 border-white/10 hover:bg-white/5 rounded-2xl sm:rounded-3xl text-sm sm:text-xl text-muted-foreground hover:text-white font-bold hover:border-white/20 transition-all shadow-2xl backdrop-blur-md"
            >
              {isFetchingMore ? 'Syncing...' : 'Historical Data'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
