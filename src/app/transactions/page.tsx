'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { localStorageService } from '@/lib/localStorage';
import { Transaction, CATEGORIES } from '@/types/transaction';
import { User } from '@/types/user';
import { convertToUSD, formatCurrency } from '@/lib/currency-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Filter, Search, X } from 'lucide-react';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<'all' | 'spending' | 'saving'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
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

  const loadTransactions = (userId: string) => {
    const userTransactions = localStorageService.getTransactionsByUserId(userId);
    setTransactions(userTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    const matchesSearch = searchTerm === '' || 
                         transaction.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.userCategory?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    return matchesFilter && matchesSearch;
  });

  // Use the formatCurrency utility for consistent formatting
  const formatAmount = (amount: number, currency: 'USD' | 'LBP') => {
    return formatCurrency(amount, currency);
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your spending and saving records</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {formatCurrency(
                    transactions
                      .filter(t => t.type === 'Saving')
                      .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0),
                    'USD'
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Total Saved</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  {formatCurrency(
                    transactions
                      .filter(t => t.type === 'Spending')
                      .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0),
                    'USD'
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Total Spent</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm xs:col-span-2 md:col-span-1">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {transactions.length}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Total Transactions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <Label htmlFor="search" className="sr-only">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="w-full sm:w-40">
                <Select value={filter} onValueChange={(value: 'all' | 'spending' | 'saving') => setFilter(value)}>
                  <SelectTrigger className="text-sm sm:text-base">
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

        {/* Add Transaction Button - Right Aligned */}
        <div className="flex justify-end">
          <Button 
            onClick={() => setShowForm(!showForm)} 
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancel' : 'Add Transaction'}
          </Button>
        </div>

        {/* Compact Transaction Form */}
        {showForm && (
          <Card className="shadow-sm border border-blue-200">
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-xs font-medium text-gray-700">Type</Label>
                    <Select value={formData.type} onValueChange={(value: 'Spending' | 'Saving') => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spending">Spending</SelectItem>
                        <SelectItem value="Saving">Saving</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-xs font-medium text-gray-700">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value: 'USD' | 'LBP') => setFormData(prev => ({ ...prev, currency: value }))}>
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
                    <Label htmlFor="amount" className="text-xs font-medium text-gray-700">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      required
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-xs font-medium text-gray-700">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-xs font-medium text-gray-700">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="h-9 text-sm">
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
                      <Label htmlFor="userCategory" className="text-xs font-medium text-gray-700">Custom Category</Label>
                      <Input
                        id="userCategory"
                        value={formData.userCategory}
                        onChange={(e) => setFormData(prev => ({ ...prev, userCategory: e.target.value }))}
                        required
                        className="h-9 text-sm"
                        placeholder="Enter category"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note" className="text-xs font-medium text-gray-700">Note (Optional)</Label>
                  <Input
                    id="note"
                    value={formData.note}
                    onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Add a note about this transaction..."
                    className="text-sm"
                  />
                </div>

                <div className="flex flex-col xs:flex-row gap-2 pt-2">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 flex-1 text-sm h-9"
                  >
                    {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
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

        {/* Transactions List */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-gray-500 text-sm sm:text-base">
                  {searchTerm || filter !== 'all' 
                    ? 'No transactions match your search criteria.' 
                    : 'No transactions found. Add your first transaction to get started!'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex flex-col xs:flex-row xs:items-center justify-between p-3 sm:p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
                        transaction.type === 'Spending' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {transaction.type === 'Spending' ? '↓' : '↑'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base truncate">
                          {transaction.category === 'Other' ? transaction.userCategory : transaction.category}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {new Date(transaction.date).toLocaleDateString()} • {transaction.note || 'No note'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between xs:justify-end gap-2 xs:gap-4 w-full xs:w-auto">
                      <p className={`font-bold text-sm sm:text-lg flex-shrink-0 ${
                        transaction.type === 'Spending' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatAmount(transaction.amount, transaction.currency)}
                      </p>
                      <div className="flex gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size={isMobile ? "sm" : "default"}
                          onClick={() => handleEdit(transaction)}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size={isMobile ? "sm" : "default"}
                          onClick={() => handleDelete(transaction.id)}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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