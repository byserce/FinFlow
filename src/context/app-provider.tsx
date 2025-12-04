'use client';

import React, { createContext, useMemo } from 'react';
import type { AppContextType, Budget, Transaction, Profile, Plan } from '@/lib/types';
import { User } from 'lucide-react';

export const AppContext = createContext<AppContextType | undefined>(undefined);

const calculateBudgetDetails = (transactions: Transaction[]) => {
  let totalBalance = 0;
  for (const t of transactions) {
    if (t.type === 'income') {
      totalBalance += t.amount;
    } else {
      totalBalance -= t.amount;
    }
  }
  return { balance: totalBalance };
};

type AppProviderProps = {
  children: React.ReactNode;
  user: any; // Reverted
  profile: any; // Reverted
  plans: Plan[];
  transactionsByPlan: { [key: string]: Transaction[] };
};

export function AppProvider({ children, plans, transactionsByPlan }: AppProviderProps) {
  
  const budgets = useMemo<Budget[]>(() => {
    return plans.map((plan) => {
      const transactions = transactionsByPlan[plan.id] || [];
      const { balance } = calculateBudgetDetails(transactions);
      return {
        ...plan,
        transactions: transactions,
        balance: balance,
        members: [], 
      };
    });
  }, [plans, transactionsByPlan]);

  const getBudgetById = (id: string) => {
    return budgets.find((b) => b.id === id);
  };
  
  const getTransactionsByBudgetId = (id: string) => {
    return transactionsByPlan[id] || [];
  }

  const value: AppContextType = {
    user: null,
    profile: null,
    budgets,
    getBudgetById,
    getTransactionsByBudgetId,
    supabase: null,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
