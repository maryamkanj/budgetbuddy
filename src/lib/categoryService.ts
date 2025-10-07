import { v4 as uuidv4 } from 'uuid';

export interface CustomCategory {
  id: string;
  name: string;
  type: 'expense' | 'saving' | 'allocation';
  userId: string;
  createdAt: string;
}

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

export class CategoryService {
  private static STORAGE_KEY = 'budgetbuddy_custom_categories';

  static getCustomCategories(userId: string, type: 'expense' | 'saving' | 'allocation' = 'allocation'): CustomCategory[] {
    if (typeof window === 'undefined') return [];
    
    const categories = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]') as CustomCategory[];
    return categories.filter(cat => cat.userId === userId && (type === 'allocation' ? true : cat.type === type));
  }

  static addCustomCategory(name: string, userId: string, type: 'expense' | 'saving' | 'allocation' = 'allocation'): CustomCategory {
    if (typeof window === 'undefined') throw new Error('Cannot access localStorage on server');
    
    const categories = this.getCustomCategories('', 'allocation'); // Get all categories
    const existing = categories.find(cat => cat.name.toLowerCase() === name.toLowerCase() && cat.userId === userId);
    
    if (existing) return existing;
    
    const newCategory: CustomCategory = {
      id: uuidv4(),
      name,
      type,
      userId,
      createdAt: new Date().toISOString()
    };
    
    categories.push(newCategory);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
    
    return newCategory;
  }

  static getCombinedCategories(userId: string, type: 'expense' | 'saving' | 'allocation' = 'allocation'): string[] {
    const defaultCategories = type === 'allocation' 
      ? [...DEFAULT_ALLOCATION_CATEGORIES] 
      : [];
      
    const customCategories = this.getCustomCategories(userId, type);
    return [...new Set([...defaultCategories, ...customCategories.map(cat => cat.name)])];
  }
}
