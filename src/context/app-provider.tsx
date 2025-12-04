'use client';

import React, { createContext, useMemo } from 'react';
import type { AppContextType, Budget, Database, Transaction } from '@/lib/types';
import { isThisMonth, parseISO } from 'date-fns';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

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
  user: User | null;
  profile: Database['public']['Tables']['budget_profiles']['Row'] | null;
  plans: Database['public']['Tables']['budget_plans']['Row'][];
  transactionsByPlan: { [key: string]: Database['public']['Tables']['budget_transactions']['Row'][] };
};

export function AppProvider({ children, user, profile, plans, transactionsByPlan }: AppProviderProps) {
  const supabase = createClient();

  // This might be unnecessary if you handle real-time updates differently
  // useEffect(() => {
  //   const channel = supabase
  //     .channel('realtime-budgets')
  //     .on(
  //       'postgres_changes',
  //       { event: '*', schema: 'public', table: 'budget_plans' },
  //       (payload) => {
  //         // Here you would re-fetch or update state
  //       }
  //     )
  //     .on(
  //       'postgres_changes',
  //       { event: '*', schema: 'public', table: 'budget_transactions' },
  //       (payload) => {
  //         // Here you would re-fetch or update state
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [supabase]);

  const budgets = useMemo<Budget[]>(() => {
    return plans.map((plan) => {
      const transactions = transactionsByPlan[plan.id] || [];
      const { balance } = calculateBudgetDetails(transactions);
      return {
        id: plan.id,
        name: plan.name,
        owner_id: plan.owner_id,
        members: [], // This would be fetched from budget_members if needed
        transactions: transactions,
        balance: balance,
      };
    });
  }, [plans, transactionsByPlan]);

  const getBudgetById = (id: string) => {
    return budgets.find((b) => b.id === id);
  };
  
  const getTransactionsByBudgetId = (id: string) => {
    return transactionsByPlan[id] || [];
  }

  const value = {
    user,
    profile,
    budgets,
    getBudgetById,
    getTransactionsByBudgetId,
    supabase
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
