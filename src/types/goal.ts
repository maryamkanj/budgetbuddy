export interface Goal {
    id: string;
    userId: string;
    title: string;
    targetAmount: number;
    targetCurrency: 'USD' | 'LBP';
    currentAmount: number;
    deadline: string;
    status: 'Active' | 'Completed' | 'Failed';
    createdAt: string;
    updatedAt: string;
  }