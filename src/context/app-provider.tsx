'use client';
import { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-user';
import type { AppContextType, Budget, Transaction, Plan } from '@/lib/types';
import { Database } from '@/lib/types';

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [transactionsByPlan, setTransactionsByPlan] = useState<{ [key: string]: Transaction[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setPlans([]);
      setTransactionsByPlan({});
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    const { data: memberEntries, error: memberError } = await supabase
      .from('budget_members')
      .select('budget_plans!inner(*)')
      .eq('user_id', user.id);

    if (memberError) {
      console.error("Error fetching member budgets:", memberError);
      setPlans([]);
      setIsLoading(false);
      return;
    }
    
    const uniquePlans = memberEntries.map(entry => entry.budget_plans).filter(Boolean) as Plan[];
    setPlans(uniquePlans);
    
    const planIds = uniquePlans.map(p => p.id);
    
    if (planIds.length > 0) {
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
  
  useEffect(() => {
    const channel = supabase
      .channel('public:budget_transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_transactions' },
        (payload) => {
          console.log('Change received!', payload);
          fetchData();
        }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_plans' },
        (payload) => {
            console.log('Change received!', payload);
            fetchData();
        }
       )
       .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_members' },
        (payload) => {
            console.log('Change received!', payload);
            fetchData();
        }
       )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchData]);
  
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
        members: [], 
      };
    });
  }, [plans, transactionsByPlan]);

  const value = useMemo(() => ({
    budgets,
    transactionsByPlan,
    supabase,
    isLoading,
  }), [budgets, transactionsByPlan, isLoading, supabase]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
