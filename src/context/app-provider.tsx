'use client';

import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { AppContextType, Budget, Transaction, Plan } from '@/lib/types';
import { useUser } from '@/hooks/use-user';
import type { SupabaseClient } from '@supabase/supabase-js';

export const AppContext = createContext<AppContextType | undefined>(undefined);

type AppProviderProps = {
  children: React.ReactNode;
  supabase: SupabaseClient;
};

export function AppProvider({ children, supabase }: AppProviderProps) {
  const { user } = useUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [transactionsByPlan, setTransactionsByPlan] = useState<{ [key: string]: Transaction[] }>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setPlans([]);
      setTransactionsByPlan({});
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    // Fetch budget plans where the user is a member
    const { data: memberEntries, error: memberError } = await supabase
      .from('budget_members')
      .select('plan_id, budget_plans(*)')
      .eq('user_id', user.id);

    if (memberError || !memberEntries) {
      console.error("Error fetching user's budgets:", memberError);
      setPlans([]);
      setIsLoading(false);
      return;
    }
    
    const userPlans = memberEntries.map(entry => entry.budget_plans).filter(Boolean) as Plan[];
    setPlans(userPlans);
    
    const planIds = userPlans.map(p => p.id);
    
    if (planIds.length > 0) {
      // Fetch all transactions for those plans
      const { data: transactions, error: txError } = await supabase
        .from('budget_transactions')
        .select('*')
        .in('plan_id', planIds);

      if (txError) {
        console.error("Error fetching transactions:", txError);
        setTransactionsByPlan({});
      } else {
        const groupedTxs = transactions.reduce((acc, tx) => {
          if (!acc[tx.plan_id]) {
            acc[tx.plan_id] = [];
          }
          acc[tx.plan_id].push(tx);
          return acc;
        }, {} as { [key: string]: Transaction[] });
        setTransactionsByPlan(groupedTxs);
      }
    } else {
      setTransactionsByPlan({});
    }

    setIsLoading(false);
  }, [user?.id, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const budgets = useMemo<Budget[]>(() => {
    return plans.map((plan) => {
      const transactions = transactionsByPlan[plan.id] || [];
      const balance = transactions.reduce((acc, t) => {
        return acc + (t.type === 'income' ? t.amount : -t.amount);
      }, 0);
      
      return {
        ...plan,
        transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        balance: balance,
        members: [], // This could be fetched if needed
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
    budgets,
    getBudgetById,
    getTransactionsByBudgetId,
    supabase,
    isLoading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
