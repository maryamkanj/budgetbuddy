import { User } from '@/types/user';
import { Transaction } from '@/types/transaction';
import { Goal } from '@/types/goal';
import { Salary, SalaryAllocation } from '@/types/salary';
import { Achievement } from '@/types/achievement';

const STORAGE_KEYS = {
  USERS: 'budgetbuddy_users',
  CURRENT_USER: 'budgetbuddy_current_user',
  TRANSACTIONS: 'budgetbuddy_transactions',
  GOALS: 'budgetbuddy_goals',
  SALARIES: 'budgetbuddy_salaries',
  SALARY_ALLOCATIONS: 'budgetbuddy_salary_allocations',
  ACHIEVEMENTS: 'budgetbuddy_achievements'
};

export const localStorageService = {
  // Users management (existing code remains the same)
  getUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  },

  setUsers(users: User[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    this.setUsers(users);
    return newUser;
  },

  findUserByEmail(email: string): User | undefined {
    const users = this.getUsers();
    return users.find(user => user.email === email);
  },

  verifyUser(email: string, password: string): User | null {
    const user = this.findUserByEmail(email);
    return user && user.password === password ? user : null;
  },

  // Current user session
  setCurrentUser(user: User | null): void {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },

  // Transactions
  getTransactions(): Transaction[] {
    if (typeof window === 'undefined') return [];
    const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return transactions ? JSON.parse(transactions) : [];
  },

  setTransactions(transactions: Transaction[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
    const transactions = this.getTransactions();
    const newTransaction: Transaction = {
      ...transaction,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    transactions.push(newTransaction);
    this.setTransactions(transactions);
    return newTransaction;
  },

  getTransactionsByUserId(userId: string): Transaction[] {
    const transactions = this.getTransactions();
    return transactions.filter(transaction => transaction.userId === userId);
  },

  // Goals
  getGoals(): Goal[] {
    if (typeof window === 'undefined') return [];
    const goals = localStorage.getItem(STORAGE_KEYS.GOALS);
    return goals ? JSON.parse(goals) : [];
  },

  setGoals(goals: Goal[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  addGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Goal {
    const goals = this.getGoals();
    const newGoal: Goal = {
      ...goal,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    goals.push(newGoal);
    this.setGoals(goals);
    return newGoal;
  },

  getGoalsByUserId(userId: string): Goal[] {
    const goals = this.getGoals();
    return goals.filter(goal => goal.userId === userId);
  },

  // Salaries
  getSalaries(): Salary[] {
    if (typeof window === 'undefined') return [];
    const salaries = localStorage.getItem(STORAGE_KEYS.SALARIES);
    return salaries ? JSON.parse(salaries) : [];
  },

  setSalaries(salaries: Salary[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SALARIES, JSON.stringify(salaries));
  },

  addSalary(salary: Omit<Salary, 'id' | 'createdAt'>): Salary {
    const salaries = this.getSalaries();
    const newSalary: Salary = {
      ...salary,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    
    salaries.push(newSalary);
    this.setSalaries(salaries);
    return newSalary;
  },

  getSalaryByUserId(userId: string): Salary | undefined {
    const salaries = this.getSalaries();
    return salaries.find(salary => salary.userId === userId);
  },

  // Salary Allocations
  getSalaryAllocations(): SalaryAllocation[] {
    if (typeof window === 'undefined') return [];
    const allocations = localStorage.getItem(STORAGE_KEYS.SALARY_ALLOCATIONS);
    return allocations ? JSON.parse(allocations) : [];
  },

  setSalaryAllocations(allocations: SalaryAllocation[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SALARY_ALLOCATIONS, JSON.stringify(allocations));
  },

  addSalaryAllocation(allocation: Omit<SalaryAllocation, 'id' | 'createdAt'>): SalaryAllocation {
    const allocations = this.getSalaryAllocations();
    const newAllocation: SalaryAllocation = {
      ...allocation,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    
    allocations.push(newAllocation);
    this.setSalaryAllocations(allocations);
    return newAllocation;
  },

  getAllocationsBySalaryId(salaryId: string): SalaryAllocation[] {
    const allocations = this.getSalaryAllocations();
    return allocations.filter(allocation => allocation.salaryId === salaryId);
  },

  // Achievements
  getAchievements(): Achievement[] {
    if (typeof window === 'undefined') return [];
    const achievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return achievements ? JSON.parse(achievements) : [];
  },

  setAchievements(achievements: Achievement[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  },

  addAchievement(achievement: Omit<Achievement, 'id'>): Achievement {
    const achievements = this.getAchievements();
    const newAchievement: Achievement = {
      ...achievement,
      id: this.generateId(),
      achievedAt: new Date().toISOString()
    };
    
    achievements.push(newAchievement);
    this.setAchievements(achievements);
    return newAchievement;
  },

  getAchievementsByUserId(userId: string): Achievement[] {
    const achievements = this.getAchievements();
    return achievements.filter(achievement => achievement.userId === userId);
  },

  // Utility functions
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Initialize sample data for new users
  initializeUserData(userId: string): void {
    // Initialize empty arrays for all data types
    const existingTransactions = this.getTransactions();
    if (existingTransactions.length === 0) {
      this.setTransactions([]);
    }
    
    const existingGoals = this.getGoals();
    if (existingGoals.length === 0) {
      this.setGoals([]);
    }
    
    const existingSalaries = this.getSalaries();
    if (existingSalaries.length === 0) {
      this.setSalaries([]);
    }
    
    const existingAchievements = this.getAchievements();
    if (existingAchievements.length === 0) {
      this.setAchievements([]);
    }
  }
};