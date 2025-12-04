'use client';

import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { mockTransactions } from '@/lib/data';
import type { AppContextType, Transaction, Budget } from '@/lib/types';
import { isThisMonth, parseISO } from 'date-fns';

export const AppContext = createContext<AppContextType | undefined>(undefined);

const calculateBudgetDetails = (transactions: Transaction[]) => {
    const currentMonthTransactions = transactions.filter((t) => isThisMonth(parseISO(t.date)));
    
    let income = 0;
    let expenses = 0;
    let totalBalance = 0;

    for (const t of transactions) {
      if (t.type === 'income') {
        totalBalance += t.amount;
      } else {
        totalBalance -= t.amount;
      }
    }
    
    for (const t of currentMonthTransactions) {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expenses += t.amount;
      }
    }

    return { balance: totalBalance, monthlyIncome: income, monthlyExpenses: expenses };
}


export function AppProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedBudgets = localStorage.getItem('finflow-budgets');
      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      } else {
        const initialBudget: Budget = {
            id: crypto.randomUUID(),
            name: 'Kişisel Bütçe',
            transactions: mockTransactions,
            balance: 0, // will be recalculated
            shared: false,
        };
        const details = calculateBudgetDetails(initialBudget.transactions);
        initialBudget.balance = details.balance;
        setBudgets([initialBudget]);
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
      // Fallback to a default budget
       const initialBudget: Budget = {
            id: crypto.randomUUID(),
            name: 'Kişisel Bütçe',
            transactions: mockTransactions,
            balance: 0, // will be recalculated
            shared: false,
        };
        const details = calculateBudgetDetails(initialBudget.transactions);
        initialBudget.balance = details.balance;
        setBudgets([initialBudget]);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        const budgetsToStore = budgets.map(b => {
            const details = calculateBudgetDetails(b.transactions);
            return { ...b, balance: details.balance };
        });
        localStorage.setItem('finflow-budgets', JSON.stringify(budgetsToStore));
      } catch (error) {
        console.error("Failed to write to localStorage", error);
      }
    }
  }, [budgets, isInitialized]);

  const createBudget = useCallback((name: string) => {
    const newBudget: Budget = {
      id: crypto.randomUUID(),
      name,
      transactions: [],
      balance: 0,
      shared: false, // Default to not shared
    };
    setBudgets((prev) => [...prev, newBudget]);
  }, []);

  const addTransaction = useCallback((budgetId: string, transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setBudgets((prev) =>
      prev.map((budget) => {
        if (budget.id === budgetId) {
          const updatedTransactions = [newTransaction, ...budget.transactions];
          return { ...budget, transactions: updatedTransactions };
        }
        return budget;
      })
    );
  }, []);

  const getBudgetById = useCallback((id: string) => {
    return budgets.find(b => b.id === id);
  }, [budgets]);
  

  // These values might need to be recalculated based on a selected budget or total
  const { balance, monthlyIncome, monthlyExpenses } = useMemo(() => {
    let totalBalance = 0;
    budgets.forEach(b => totalBalance += b.balance);
    // For now, we'll just return total. Specifics will be per budget.
    return { balance: totalBalance, monthlyIncome: 0, monthlyExpenses: 0 };
  }, [budgets]);

  const value = {
    budgets,
    createBudget,
    getBudgetById,
    addTransaction,
    balance,
    monthlyIncome,
    monthlyExpenses,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
