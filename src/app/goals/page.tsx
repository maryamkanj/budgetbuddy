'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { localStorageService } from '@/lib/localStorage';
import { Goal } from '@/types/goal';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GoalsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    targetCurrency: 'USD' as 'USD' | 'LBP',
    currentAmount: '',
    deadline: ''
  });

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadGoals(currentUser.id);

    // Check if mobile on initial render
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [router]);

  const loadGoals = (userId: string) => {
    const userGoals = localStorageService.getGoalsByUserId(userId);
    setGoals(userGoals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const targetAmount = parseFloat(formData.targetAmount);
      const currentAmount = parseFloat(formData.currentAmount || '0');
      const deadline = new Date(formData.deadline);
      const now = new Date();

      let status: 'Active' | 'Completed' | 'Failed' = 'Active';
      if (currentAmount >= targetAmount) {
        status = 'Completed';
      } else if (deadline < now) {
        status = 'Failed';
      }

      const goalData = {
        userId: user.id,
        title: formData.title,
        targetAmount,
        targetCurrency: formData.targetCurrency,
        currentAmount,
        deadline: formData.deadline,
        status
      };

      if (editingGoal) {
        // Update existing goal
        const updatedGoals = goals.map(g => 
          g.id === editingGoal.id 
            ? { ...g, ...goalData, updatedAt: new Date().toISOString() }
            : g
        );
        localStorageService.setGoals(updatedGoals);
        setGoals(updatedGoals);
        toast.success('Goal updated successfully');
      } else {
        // Add new goal
        const newGoal = localStorageService.addGoal(goalData);
        setGoals(prev => [newGoal, ...prev]);
        toast.success('Goal created successfully');
      }

      resetForm();
    } catch (error) {
      toast.error('Failed to save goal');
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      targetCurrency: goal.targetCurrency,
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline
    });
    setShowForm(true);
  };

  const handleDelete = (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    const updatedGoals = goals.filter(g => g.id !== goalId);
    localStorageService.setGoals(updatedGoals);
    setGoals(updatedGoals);
    toast.success('Goal deleted successfully');
  };

  const updateProgress = (goalId: string, newAmount: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        let status: 'Active' | 'Completed' | 'Failed' = goal.status;
        if (newAmount >= goal.targetAmount) {
          status = 'Completed';
          toast.success(`Congratulations! You've completed your goal: ${goal.title}`);
        } else if (new Date(goal.deadline) < new Date()) {
          status = 'Failed';
        }

        return {
          ...goal,
          currentAmount: newAmount,
          status,
          updatedAt: new Date().toISOString()
        };
      }
      return goal;
    });

    localStorageService.setGoals(updatedGoals);
    setGoals(updatedGoals);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      targetAmount: '',
      targetCurrency: 'USD',
      currentAmount: '',
      deadline: ''
    });
    setEditingGoal(null);
    setShowForm(false);
  };

  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    return goal.status.toLowerCase() === filter;
  });

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'LBP') {
      // Format LBP with LBP symbol and no decimals
      return `LBP ${amount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}`;
    }
    
    // Format USD with $ symbol
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Financial Goals</h1>
            <p className="text-sm sm:text-base text-gray-600">Set and track your financial objectives</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex gap-3 sm:gap-4">
              <Select value={filter} onValueChange={(value: 'all' | 'active' | 'completed' | 'failed') => setFilter(value)}>
                <SelectTrigger className="w-full sm:w-48 text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Goals</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Add Goal Button - Right Aligned */}
        <div className="flex justify-end">
          <Button 
            onClick={() => setShowForm(!showForm)} 
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancel' : 'New Goal'}
          </Button>
        </div>

        {/* Compact Goal Form */}
        {showForm && (
          <Card className="shadow-sm border border-blue-200">
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs font-medium text-gray-700">Goal Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Save for vacation, Buy new laptop"
                    required
                    className="text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount" className="text-xs font-medium text-gray-700">Target Amount</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      step="0.01"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                      required
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetCurrency" className="text-xs font-medium text-gray-700">Currency</Label>
                    <Select value={formData.targetCurrency} onValueChange={(value: 'USD' | 'LBP') => setFormData(prev => ({ ...prev, targetCurrency: value }))}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="LBP">LBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentAmount" className="text-xs font-medium text-gray-700">Current Amount</Label>
                    <Input
                      id="currentAmount"
                      type="number"
                      step="0.01"
                      value={formData.currentAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                      required
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline" className="text-xs font-medium text-gray-700">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      required
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col xs:flex-row gap-2 pt-2">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 flex-1 text-sm h-9"
                  >
                    {editingGoal ? 'Update Goal' : 'Create Goal'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    className="flex-1 text-sm h-9"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredGoals.length === 0 ? (
            <div className="col-span-full text-center py-8 sm:py-12 px-4">
              <Target className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No goals found</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">
                {filter === 'all' 
                  ? "Create your first financial goal to get started!" 
                  : `No ${filter} goals found.`}
              </p>
              {filter !== 'all' && (
                <Button 
                  onClick={() => setFilter('all')} 
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                >
                  View All Goals
                </Button>
              )}
            </div>
          ) : (
            filteredGoals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const daysLeft = getDaysLeft(goal.deadline);
              const isOverdue = daysLeft < 0;

              return (
                <Card key={goal.id} className={`relative shadow-sm ${
                  goal.status === 'Completed' ? 'border-green-200 bg-green-50' :
                  goal.status === 'Failed' ? 'border-red-200 bg-red-50' :
                  'border-gray-200'
                }`}>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex justify-between items-start gap-2">
                      <span className="text-base sm:text-lg break-words flex-1">{goal.title}</span>
                      <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                        goal.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        goal.status === 'Failed' ? 'bg-red-100 text-red-800' :
                        isOverdue ? 'bg-red-100 text-red-800' :
                        daysLeft < 7 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {goal.status === 'Completed' ? 'Completed' :
                         goal.status === 'Failed' ? 'Failed' :
                         isOverdue ? `${Math.abs(daysLeft)}d overdue` :
                         `${daysLeft}d left`}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold">
                          {formatAmount(goal.currentAmount, goal.targetCurrency)} / {formatAmount(goal.targetAmount, goal.targetCurrency)}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="text-right text-xs sm:text-sm font-medium">
                        {progress.toFixed(1)}%
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{formatDate(goal.deadline)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{goal.targetCurrency}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size={isMobile ? "sm" : "default"}
                        className="flex-1"
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size={isMobile ? "sm" : "default"}
                        onClick={() => handleDelete(goal.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>

                    {goal.status === 'Active' && (
                      <div className="space-y-2">
                        <Label htmlFor={`progress-${goal.id}`} className="text-xs sm:text-sm">Update Progress</Label>
                        <div className="flex gap-2">
                          <Input
                            id={`progress-${goal.id}`}
                            type="number"
                            step="0.01"
                            placeholder="Add amount"
                            className="flex-1 text-sm h-8 sm:h-9"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                const newAmount = goal.currentAmount + parseFloat(input.value || '0');
                                updateProgress(goal.id, newAmount);
                                input.value = '';
                              }
                            }}
                          />
                          <Button
                            size={isMobile ? "sm" : "default"}
                            onClick={(e) => {
                              const input = (e.target as HTMLButtonElement).previousSibling as HTMLInputElement;
                              const newAmount = goal.currentAmount + parseFloat(input.value || '0');
                              updateProgress(goal.id, newAmount);
                              input.value = '';
                            }}
                            className="h-8 sm:h-9"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}