import type { LucideIcon } from "lucide-react";
import type { User, SupabaseClient } from '@supabase/supabase-js';
export type { Database } from './types/supabase';
import { Database } from './types/supabase';


export type Transaction = Database['public']['Tables']['budget_transactions']['Row'];
export type Plan = Database['public']['Tables']['budget_plans']['Row'];
export type Profile = Database['public']['Tables']['budget_profiles']['Row'];


export type Budget = Plan & {
  transactions: Transaction[];
  balance: number;
  members: any[]; // Replace with member type
};

export type Category = 
  // Income
  | 'Salary' 
  | 'Gifts'
  | 'Freelance'
  | 'Investments'
  | 'Other Income'
  // Expense
  | 'Food' 
  | 'Transport' 
  | 'Housing' 
  | 'Entertainment' 
  | 'Shopping' 
  | 'Health' 
  | 'Other';

export type CategoryInfo = {
  icon: LucideIcon;
  color: string;
  type: 'income' | 'expense';
  label: string;
};

export type AppContextType = {
  user: User | null;
  profile: Profile | null;
  budgets: Budget[];
  getBudgetById: (id: string) => Budget | undefined;
  getTransactionsByBudgetId: (id: string) => Transaction[];
  supabase: SupabaseClient;
};
