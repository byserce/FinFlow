'use client';
import { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-user';
import type { AppContextType, Budget, Transaction, Plan, Member } from '@/lib/types';
import { Database } from '@/lib/types';

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isUserLoading } = useUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [transactionsByPlan, setTransactionsByPlan] = useState<{ [key: string]: Transaction[] }>({});
  const [membersByPlan, setMembersByPlan] = useState<{ [key: string]: Member[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (isUserLoading) {
        return;
    }
    if (!user?.id) {
      setPlans([]);
      setTransactionsByPlan({});
      setMembersByPlan({});
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    const { data: memberEntries, error: memberError } = await supabase
      .from('budget_members')
      .select('budget_plans!inner(*)')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

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
      
      const { data: members, error: membersError } = await supabase
        .from('budget_members')
        .select('*')
        .in('plan_id', planIds);

      if (membersError) {
        console.error("Error fetching members:", membersError);
        setMembersByPlan({});
      } else {
        const groupedMembers = members.reduce((acc, member) => {
            if (!acc[member.plan_id]) {
                acc[member.plan_id] = [];
            }
            acc[member.plan_id].push(member);
            return acc;
        }, {} as { [key: string]: Member[] });
        setMembersByPlan(groupedMembers);
      }

    } else {
      setTransactionsByPlan({});
      setMembersByPlan({});
    }

    setIsLoading(false);
  }, [user?.id, supabase, isUserLoading]);

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
        members: membersByPlan[plan.id] || [], 
      };
    });
  }, [plans, transactionsByPlan, membersByPlan]);

  const value = useMemo(() => ({
    budgets,
    transactionsByPlan,
    supabase,
    isLoading,
    refetch: fetchData,
  }), [budgets, transactionsByPlan, isLoading, supabase, fetchData]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
