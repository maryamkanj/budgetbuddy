import { Database } from './database';

// Salary types
export type Salary = Database['public']['Tables']['salaries']['Row'];
export type SalaryInsert = Omit<Database['public']['Tables']['salaries']['Insert'], 'user_id'>;
export type SalaryUpdate = Omit<Database['public']['Tables']['salaries']['Update'], 'user_id'>;

// Salary Allocation types
export type SalaryAllocation = Database['public']['Tables']['salary_allocations']['Row'];
export type SalaryAllocationInsert = Omit<Database['public']['Tables']['salary_allocations']['Insert'], 'user_id'>;
export type SalaryAllocationUpdate = Omit<Database['public']['Tables']['salary_allocations']['Update'], 'user_id'>;

// Form types
export interface SalaryFormValues {
  salary_name: string;
  base_salary: string;
  currency: 'USD' | 'LBP';
  company_name?: string;
}

export interface AllocationFormValues {
  category: string;
  percentage?: number;
}

// Context types
export interface SalariesContextType {
  salaries: Salary[];
  salaryAllocations: SalaryAllocation[];
  selectedSalaryId: string | null;
  setSelectedSalaryId: (id: string | null) => void;
  selectedSalary: Salary | null;
  currentAllocations: SalaryAllocation[];
  initializeSalaries: (salaries: Salary[], allocations: SalaryAllocation[]) => void;
  createSalary: (data: SalaryInsert) => Promise<Salary>;
  updateSalary: (id: string, data: SalaryUpdate) => Promise<Salary>; // Changed from Promise<void>
  deleteSalary: (id: string) => Promise<void>;
  createSalaryAllocation: (data: SalaryAllocationInsert) => Promise<SalaryAllocation>;
  deleteSalaryAllocation: (id: string) => Promise<void>;
  handleAddNewSalary: () => void;
  handleEditSalary: (salary: Salary) => void;
  handleDeleteSalaryClick: () => void;
  handleAddAllocation: (allocation: AllocationFormValues) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

// Component props types
export interface SalaryOverviewProps {
  selectedSalary: Salary;
  allocations: SalaryAllocation[];
  onEditSalary: (salary: Salary) => void;
  onDeleteSalary: () => void;
  onAddAllocation: (allocation: AllocationFormValues) => void;
}

export interface AllocationFormProps {
  salary: Salary;
  allocations: SalaryAllocation[];
  onAddAllocation: (allocation: AllocationFormValues) => void;
  compact?: boolean;
}

export interface AllocationDistributionProps {
  selectedSalary: Salary;
  allocations: SalaryAllocation[];
  editingAllocationId: string | null;
  editAllocationForm: { category: string; percentage: number };
  setEditAllocationForm: (form: { category: string; percentage: number }) => void;
  setEditingAllocationId: (id: string | null) => void;
  handleEditAllocation: (allocation: SalaryAllocation) => void;
  handleUpdateAllocation: (e: React.FormEvent) => void;
  handleDeleteAllocation: (id: string) => void;
}
