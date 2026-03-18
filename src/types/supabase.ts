export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          subscription_tier: 'Free' | 'Pro' | 'Business'
          stripe_customer_id: string | null
          email_verified: boolean
          avatar_url: string | null
          timezone: string
          currency: 'USD' | 'LBP'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          subscription_tier?: 'Free' | 'Pro' | 'Business'
          stripe_customer_id?: string | null
          email_verified?: boolean
          avatar_url?: string | null
          timezone?: string
          currency?: 'USD' | 'LBP'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          subscription_tier?: 'Free' | 'Pro' | 'Business'
          stripe_customer_id?: string | null
          email_verified?: boolean
          avatar_url?: string | null
          timezone?: string
          currency?: 'USD' | 'LBP'
          updated_at?: string
        }
        Relationships: never[]
      }
      custom_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'expense' | 'saving' | 'allocation'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'expense' | 'saving' | 'allocation'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'expense' | 'saving' | 'allocation'
          created_at?: string
        }
        Relationships: never[]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          category: 'Food' | 'Transport' | 'Bills' | 'Entertainment' | 'Other'
          user_category: string | null
          amount: number
          currency: 'USD' | 'LBP'
          type: 'Spending' | 'Saving'
          note: string | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: 'Food' | 'Transport' | 'Bills' | 'Entertainment' | 'Other'
          user_category?: string | null
          amount: number
          currency?: 'USD' | 'LBP'
          type: 'Spending' | 'Saving'
          note?: string | null
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: 'Food' | 'Transport' | 'Bills' | 'Entertainment' | 'Other'
          user_category?: string | null
          amount?: number
          currency?: 'USD' | 'LBP'
          type?: 'Spending' | 'Saving'
          note?: string | null
          date?: string
          updated_at?: string
        }
        Relationships: never[]
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          target_amount: number
          target_currency: 'USD' | 'LBP'
          current_amount: number
          deadline: string
          status: 'Active' | 'Completed' | 'Failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          target_amount: number
          target_currency?: 'USD' | 'LBP'
          current_amount?: number
          deadline: string
          status?: 'Active' | 'Completed' | 'Failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          target_amount?: number
          target_currency?: 'USD' | 'LBP'
          current_amount?: number
          deadline?: string
          status?: 'Active' | 'Completed' | 'Failed'
          updated_at?: string
        }
        Relationships: never[]
      }
      salaries: {
        Row: {
          id: string
          user_id: string
          name: string | null
          salary_name: string | null
          company_name: string | null
          base_salary: number
          currency: 'USD' | 'LBP'
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          salary_name?: string | null
          company_name?: string | null
          base_salary: number
          currency?: 'USD' | 'LBP'
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          salary_name?: string | null
          company_name?: string | null
          base_salary?: number
          currency?: 'USD' | 'LBP'
          updated_at?: string | null
        }
        Relationships: never[]
      }
      salary_allocations: {
        Row: {
          id: string
          salary_id: string
          category: string
          percentage: number
          allocated_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          salary_id: string
          category: string
          percentage: number
          allocated_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          salary_id?: string
          category?: string
          percentage?: number
          allocated_amount?: number
        }
        Relationships: never[]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: 'Free' | 'Pro' | 'Business'
          status: 'active' | 'cancelled' | 'past_due'
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier: 'Free' | 'Pro' | 'Business'
          status?: 'active' | 'cancelled' | 'past_due'
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier?: 'Free' | 'Pro' | 'Business'
          status?: 'active' | 'cancelled' | 'past_due'
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          updated_at?: string
        }
        Relationships: never[]
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          metric: 'transactions' | 'goals' | 'salaries' | 'team_members'
          count: number
          period_start: string
          period_end: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          metric: 'transactions' | 'goals' | 'salaries' | 'team_members'
          count?: number
          period_start: string
          period_end: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          metric?: 'transactions' | 'goals' | 'salaries' | 'team_members'
          count?: number
          period_start?: string
          period_end?: string
        }
        Relationships: never[]
      }
      system_config: {
        Row: {
          id: string
          key: string
          value: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          description?: string | null
          updated_at?: string
        }
        Relationships: never[]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
