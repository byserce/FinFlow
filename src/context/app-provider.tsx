'use client';
import { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-user';
import type { AppContextType, Budget, Transaction, Plan, Member, Profile, TransactionParticipant } from '@/lib/types';
import { Database } from '@/lib/types';

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isUserLoading } = useUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [transactionsByPlan, setTransactionsByPlan] = useState<{ [key: string]: Transaction[] }>({});
  const [membersByPlan, setMembersByPlan] = useState<{ [key: string]: Member[] }>({});
  const [transactionParticipants, setTransactionParticipants] = useState<TransactionParticipant[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    const { data: profilesData, error: profilesError } = await supabase.from('budget_profiles').select('*');
    if (profilesError) console.error("Error fetching profiles:", profilesError);
    setAllProfiles(profilesData || []);

    if (isUserLoading || !user?.id) {
      setPlans([]);
      setTransactionsByPlan({});
      setMembersByPlan({});
      setTransactionParticipants([]);
      setIsLoading(false);
      return;
    }
    
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
      const [txResult, membersResult, participantsResult] = await Promise.all([
        supabase.from('budget_transactions').select('*').in('plan_id', planIds),
        supabase.from('budget_members').select('*').in('plan_id', planIds),
        supabase.from('transaction_participants').select('*, budget_transactions!inner(plan_id)').in('budget_transactions.plan_id', planIds)
      ]);

      const { data: transactions, error: txError } = txResult;
      if (txError) console.error("Error fetching transactions:", txError);
      const groupedTxs = (transactions || []).reduce((acc, tx) => {
          if (!acc[tx.plan_id]) acc[tx.plan_id] = [];
          acc[tx.plan_id].push(tx);
          return acc;
        }, {} as { [key: string]: Transaction[] });
      setTransactionsByPlan(groupedTxs);

      const { data: members, error: membersError } = membersResult;
      if (membersError) console.error("Error fetching members:", membersError);
      const groupedMembers = (members || []).reduce((acc, member) => {
        if (!acc[member.plan_id]) acc[member.plan_id] = [];
        acc[member.plan_id].push(member);
        return acc;
      }, {} as { [key: string]: Member[] });
      setMembersByPlan(groupedMembers);

      const { data: participants, error: participantsError } = participantsResult;
      if (participantsError) console.error("Error fetching participants:", participantsError);
      setTransactionParticipants((participants as any) || []);

    } else {
      setTransactionsByPlan({});
      setMembersByPlan({});
      setTransactionParticipants([]);
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
    transactionParticipants,
    allProfiles,
    supabase,
    isLoading,
    refetch: fetchData,
  }), [budgets, transactionsByPlan, transactionParticipants, allProfiles, isLoading, supabase, fetchData]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
