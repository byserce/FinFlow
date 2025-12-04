import type { LucideIcon } from "lucide-react";

export type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  date: string; // ISO String
  note?: string;
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
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
};
