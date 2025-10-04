export interface Salary {
    id: string;
    userId: string;
    baseSalary: number;
    currency: 'USD' | 'LBP';
    createdAt: string;
  }
  
  export interface SalaryAllocation {
    id: string;
    salaryId: string;
    category: string;
    percentage: number;
    allocatedAmount: number;
    createdAt: string;
  }