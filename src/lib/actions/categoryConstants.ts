import { Database } from '@/types/database';

export type CustomCategory = Database['public']['Tables']['custom_categories']['Row'];

export const DEFAULT_ALLOCATION_CATEGORIES = [
  'Housing',
  'Food',
  'Transportation',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Savings',
  'Investments',
  'Debt Payment',
  'Education',
  'Personal Care',
  'Clothing',
  'Gifts',
  'Donations',
  'Other'
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Bills',
  'Entertainment',
  'Shopping',
  'Health',
  'Education',
  'Travel',
  'Other'
];

export const DEFAULT_SAVING_CATEGORIES = [
  'Emergency Fund',
  'Retirement',
  'Vacation',
  'Down Payment',
  'Investment',
  'Health',
  'Education',
  'Other'
];

export const DB_TRANSACTION_CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'] as const;
export type DbTransactionCategory = typeof DB_TRANSACTION_CATEGORIES[number];
