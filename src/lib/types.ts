import type { LucideIcon } from "lucide-react";

export type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  date: string; // ISO String
  note?: string;
};

export type Category = 'Salary' | 'Food' | 'Transport' | 'Housing' | 'Entertainment' | 'Shopping' | 'Health' | 'Other';

export type CategoryInfo = {
  icon: LucideIcon;
  color: string;
};

export type AppContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
};
