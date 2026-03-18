'use client';

import { Database } from '@/types/supabase';

import { useMemo, useState, useEffect, useRef } from 'react';
import { useGoals } from '@/providers/GoalProvider';
import { formatCurrency } from '@/lib/utils/financial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/ui/statCard';
import { Target, TrendingUp, CheckCircle2, AlertCircle, Calendar, Edit, Trash2, Plus } from 'lucide-react';
import { useGoalsPage } from './GoalsClient';
import { LoadingPage } from '@/components/ui/loadingSpinner';

export function GoalsList({ initialGoals = [] }: { initialGoals?: Database['public']['Tables']['goals']['Row'][] }) {
  const { goals: ctxGoals, loading, initializeGoals } = useGoals();
  const { openEditModal, openDeleteModal, openAddModal } = useGoalsPage();

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializeGoals(initialGoals);
      initializedRef.current = true;
    }
  }, [initialGoals, initializeGoals]);

  const goals = initializedRef.current ? ctxGoals : initialGoals;
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      if (filter === 'all') return true;
      return goal.status.toLowerCase() === filter;
    });
  }, [goals, filter]);

  const stats = useMemo(() => {
    return {
      total: goals.length,
      active: goals.filter(g => g.status === 'Active' && g.current_amount < g.target_amount).length,
      completed: goals.filter(g => g.status === 'Completed' || (g.status === 'Active' && g.current_amount >= g.target_amount)).length,
      failed: goals.filter(g => g.status === 'Failed').length,
    };
  }, [goals]);

  if (loading && !goals.length) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Goals"
          value={stats.total}
          icon={Target}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={TrendingUp}
          iconColor="text-blue-400"
          iconBgColor="bg-blue-400/10"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          iconColor="text-emerald-400"
          iconBgColor="bg-emerald-400/10"
        />
        <StatCard
          title="Overdue/Failed"
          value={stats.failed}
          icon={AlertCircle}
          iconColor="text-rose-400"
          iconBgColor="bg-rose-400/10"
        />
      </div>

      <Card className="rounded-xl border border-border bg-card/40 backdrop-blur-md p-2">
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'completed', 'failed'] as const).map((opt) => (
            <Button
              key={opt}
              variant={filter === opt ? 'default' : 'ghost'}
              onClick={() => setFilter(opt)}
              className={`flex-1 min-w-[100px] h-11 rounded-xl capitalize font-semibold transition-all ${filter === opt ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'
                }`}
            >
              {opt}
            </Button>
          ))}
        </div>
      </Card>

      <div className="space-y-6">
        {filteredGoals.length === 0 ? (
          <Card className="border-dashed border-2 py-20 bg-card/20 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
              <Target className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-bold mb-2">No goals found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-8">
              {filter === 'all'
                ? "You haven't set any financial goals yet. Let's start planning for your future!"
                : `You don't have any ${filter} goals at the moment.`}
            </p>
            <Button
              onClick={openAddModal}
              variant="outline"
              className="rounded-xl border-border hover:bg-white/5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Goal
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => {
              const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
              const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && goal.status === 'Active';

              return (
                <Card key={goal.id} className="group relative border-border bg-card/70 rounded-xl shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 backdrop-blur-md overflow-hidden">
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${goal.status === 'Completed' || goal.current_amount >= goal.target_amount ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      goal.status === 'Failed' || isOverdue ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        'bg-primary/10 text-primary border-primary/20'
                      }`}>
                      {goal.current_amount >= goal.target_amount ? 'Completed' : goal.status}
                    </Badge>
                  </div>

                  <CardHeader className="pb-4 pt-6 px-6">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors pr-20 truncate">
                        {goal.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 pb-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-widest opacity-50">Current</p>
                          <p className="text-2xl font-mono font-bold tracking-tighter">
                            {formatCurrency(goal.current_amount, goal.target_currency as "USD" | "LBP")}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-xs font-bold uppercase tracking-widest opacity-50">Target</p>
                          <p className="text-lg font-mono font-medium opacity-80">
                            {formatCurrency(goal.target_amount, goal.target_currency as "USD" | "LBP")}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                          <span className="opacity-50">Completion</span>
                          <span className="text-primary">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-3 bg-white/5 rounded-full" />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="ghost"
                        onClick={() => openEditModal(goal)}
                        className="flex-1 h-11 rounded-xl bg-secondary/30 hover:bg-secondary/50 text-foreground transition-all"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => openDeleteModal(goal.id)}
                        className="h-11 w-11 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 transition-all border border-rose-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
