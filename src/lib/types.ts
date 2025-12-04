import type { LucideIcon } from "lucide-react";
import type { SupabaseClient } from '@supabase/supabase-js';
export type { Database } from './types/supabase';
import { Database } from './types/supabase';

// Manual Profile type based on new schema
export type Profile = {
    id: string;
    email: string;
    display_name: string | null;
    photo_url: string | null;
    // password is not included for security
};

// Types from Supabase schema
export type Transaction = Database['public']['Tables']['budget_transactions']['Row'];
export type Plan = Database['public']['Tables']['budget_plans']['Row'];


export type Budget = Plan & {
  transactions: Transaction[];
  balance: number;
  members: string[]; // Changed from Member[] to string[]
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
  label:string;
};

export type AppContextType = {
  budgets: Budget[];
  transactionsByPlan: { [key: string]: Transaction[] };
  supabase: SupabaseClient<Database>;
  isLoading: boolean;
};
