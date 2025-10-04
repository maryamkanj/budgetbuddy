export interface Transaction {
    id: string;
    userId: string;
    category: string;
    userCategory?: string;
    amount: number;
    currency: 'USD' | 'LBP';
    type: 'Spending' | 'Saving';
    note?: string;
    date: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'] as const;
  export type Category = typeof CATEGORIES[number];