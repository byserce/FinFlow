'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, History, Wallet } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Budget, Transaction, Plan } from '@/lib/types';


function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();

  // Extract budgetId from pathname, e.g., /budget/xyz/analytics -> xyz
  const budgetIdMatch = pathname.match(/budget\/([^/]+)/);
  const budgetId = budgetIdMatch ? budgetIdMatch[1] : null;

  const navItems = [
    { href: '/', label: 'Bütçeler', icon: Wallet, exact: true },
    { href: `/budget/${budgetId}`, label: 'Genel Bakış', icon: Home },
    { href: `/budget/${budgetId}/analytics`, label: 'Analiz', icon: BarChart2 },
    { href: `/budget/${budgetId}/history`, label: 'Geçmiş', icon: History },
  ];

  // If we are not in a specific budget, only show the Budgets link
  const itemsToShow = budgetId ? navItems : [navItems[0]];
  
  if (!user) {
    return null; // Don't show nav if user is not logged in
  }


  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-lg border-t border-border/50 shadow-t-lg md:hidden z-50">
      <div className={`grid h-full max-w-lg mx-auto grid-cols-${itemsToShow.length}`}>
        {itemsToShow.map((item) => {
          if (!item.href) return null;
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== '/';
          return (
            <Link
              key={item.label}
              href={item.href}
              className="inline-flex flex-col items-center justify-center text-center text-muted-foreground hover:text-foreground group"
            >
              <item.icon
                className={cn(
                  'h-6 w-6 mb-1 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span className={cn(
                'text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
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

    // 1. Fetch budgets where the user is the owner
    const { data: ownedPlans, error: ownedError } = await supabase
      .from('budget_plans')
      .select('*')
      .eq('owner_id', user.id);

    if (ownedError) {
        console.error("Error fetching owned budgets:", ownedError);
    }

    // 2. Fetch budgets where the user is a member
    const { data: memberEntries, error: memberError } = await supabase
      .from('budget_members')
      .select('budget_plans!inner(*)')
      .eq('user_id', user.id);

    if (memberError) {
      console.error("Error fetching member budgets:", memberError);
    }

    const memberPlans = memberEntries?.map(entry => entry.budget_plans).filter(Boolean) as Plan[] || [];
    
    // 3. Combine and deduplicate plans
    const allPlans = [...(ownedPlans || []), ...memberPlans];
    const uniquePlans = Array.from(new Map(allPlans.map(p => [p.id, p])).values());
    
    setPlans(uniquePlans);
    
    const planIds = uniquePlans.map(p => p.id);
    
    // 4. Fetch transactions for all accessible plans
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
    // Add a listener for real-time updates
     const subscription = supabase
      .channel('public:budget_transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_transactions' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_plans' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_members' }, fetchData)
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchData, supabase]);
  
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

  // Clone the child element and pass the budgets and isLoading state as props
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, { budgets, isBudgetsLoading: isLoading });
    }
    return child;
  });


  return (
    <div className="relative flex flex-col min-h-screen">
      <main className="flex-1 pb-20 md:pb-0">
        <AnimatePresence mode="wait" initial={false}>
          {childrenWithProps}
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
