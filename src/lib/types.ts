import type { LucideIcon } from "lucide-react";

export type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  date: string; // ISO String
  note?: string;
};

export type Budget = {
  id: string;
  name: string;
  transactions: Transaction[];
  balance: number;
  shared: boolean;
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
  budgets: Budget[];
  createBudget: (name: string) => void;
  getBudgetById: (id: string) => Budget | undefined;
  addTransaction: (budgetId: string, transaction: Omit<Transaction, 'id'>) => void;
  balance: number; // This might be deprecated or represent total balance across budgets
  monthlyIncome: number; // This might be deprecated
  monthlyExpenses: number; // This might be deprecated
};
