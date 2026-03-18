import { Database } from './database';

// Goal types
export type Goal = Database['public']['Tables']['goals']['Row'];
export type GoalInsert = Omit<Database['public']['Tables']['goals']['Insert'], 'user_id'>;
export type GoalUpdate = Omit<Database['public']['Tables']['goals']['Update'], 'user_id'>;

// Form types
export interface GoalFormValues {
  name: string;
  target_amount: string;
  current_amount?: string;
  target_date: string;
  category: string;
  description?: string;
}

// Context types
export interface GoalsContextType {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  createGoal: (goal: GoalInsert) => Promise<Goal>;
  updateGoal: (id: string, updates: GoalUpdate) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  refreshGoals: () => Promise<void>;
}

// Component props types
export interface GoalsListProps {
  goals: Goal[];
  isLoading: boolean;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

export interface GoalFormModalProps {
  goal?: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: GoalFormValues) => Promise<void>;
}

// Goal progress calculation
export interface GoalProgress {
  percentage: number;
  remaining: number;
  daysLeft: number;
  isCompleted: boolean;
  isOverdue: boolean;
}
