import { User } from '@/types/user';

const STORAGE_KEYS = {
  USERS: 'budgetbuddy_users',
  CURRENT_USER: 'budgetbuddy_current_user',
  TRANSACTIONS: 'budgetbuddy_transactions',
  GOALS: 'budgetbuddy_goals',
  SALARIES: 'budgetbuddy_salaries',
  ACHIEVEMENTS: 'budgetbuddy_achievements'
};

export const localStorageService = {
  // Users management
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

  // Utility functions
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Initialize sample data for new users
  initializeUserData(userId: string): void {
    const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!transactions) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    }
    
    const goals = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!goals) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
    }
    
    const salaries = localStorage.getItem(STORAGE_KEYS.SALARIES);
    if (!salaries) {
      localStorage.setItem(STORAGE_KEYS.SALARIES, JSON.stringify([]));
    }
    
    const achievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (!achievements) {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify([]));
    }
  }
};