'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { localStorageService } from '@/lib/localStorage';
import { Transaction, CATEGORIES } from '@/types/transaction';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<'all' | 'spending' | 'saving'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    category: 'Food',
    userCategory: '',
    amount: '',
    currency: 'USD' as 'USD' | 'LBP',
    type: 'Spending' as 'Spending' | 'Saving',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadTransactions(currentUser.id);
  }, [router]);

  const loadTransactions = (userId: string) => {
    const userTransactions = localStorageService.getTransactionsByUserId(userId);
    setTransactions(userTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const transactionData = {
        userId: user.id,
        category: formData.category,
        userCategory: formData.category === 'Other' ? formData.userCategory : '',
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        type: formData.type,
        note: formData.note,
        date: formData.date
      };

      if (editingTransaction) {
        // Update existing transaction
        const updatedTransactions = transactions.map(t => 
          t.id === editingTransaction.id 
            ? { ...t, ...transactionData, updatedAt: new Date().toISOString() }
            : t
        );
        localStorageService.setTransactions(updatedTransactions);
        setTransactions(updatedTransactions);
        toast.success('Transaction updated successfully');
      } else {
        // Add new transaction
        const newTransaction = localStorageService.addTransaction(transactionData);
        setTransactions(prev => [newTransaction, ...prev]);
        toast.success('Transaction added successfully');
      }

      resetForm();
    } catch (error) {
      toast.error('Failed to save transaction');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      category: transaction.category,
      userCategory: transaction.userCategory || '',
      amount: transaction.amount.toString(),
      currency: transaction.currency,
      type: transaction.type,
      note: transaction.note || '',
      date: transaction.date
    });
    setShowForm(true);
  };

  const handleDelete = (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    localStorageService.setTransactions(updatedTransactions);
    setTransactions(updatedTransactions);
    toast.success('Transaction deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      category: 'Food',
      userCategory: '',
      amount: '',
      currency: 'USD',
      type: 'Spending',
      note: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingTransaction(null);
    setShowForm(false);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type.toLowerCase() === filter;
    const matchesSearch = transaction.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.userCategory?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'LBP' ? 'USD' : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600">Manage your spending and saving records</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={filter} onValueChange={(value: 'all' | 'spending' | 'saving') => setFilter(value)}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="spending">Spending</SelectItem>
                    <SelectItem value="saving">Saving</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value: 'Spending' | 'Saving') => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spending">Spending</SelectItem>
                        <SelectItem value="Saving">Saving</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value: 'USD' | 'LBP') => setFormData(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="LBP">LBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.category === 'Other' && (
                    <div className="space-y-2">
                      <Label htmlFor="userCategory">Custom Category</Label>
                      <Input
                        id="userCategory"
                        value={formData.userCategory}
                        onChange={(e) => setFormData(prev => ({ ...prev, userCategory: e.target.value }))}
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Note (Optional)</Label>
                  <Input
                    id="note"
                    value={formData.note}
                    onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Add a note about this transaction..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions found. Add your first transaction to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        transaction.type === 'Spending' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {transaction.type === 'Spending' ? '↓' : '↑'}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {transaction.category === 'Other' ? transaction.userCategory : transaction.category}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.date).toLocaleDateString()} • {transaction.note || 'No note'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`text-lg font-bold ${
                        transaction.type === 'Spending' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatAmount(transaction.amount, transaction.currency)}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}