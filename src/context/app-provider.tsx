'use client';

import React, { createContext, useState, useEffect, useMemo } from 'react';
import { mockTransactions } from '@/lib/data';
import type { AppContextType, Transaction } from '@/lib/types';
import { isThisMonth, parseISO } from 'date-fns';

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem('finflow-transactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        setTransactions(mockTransactions);
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
      setTransactions(mockTransactions);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('finflow-transactions', JSON.stringify(transactions));
      } catch (error) {
        console.error("Failed to write to localStorage", error);
      }
    }
  }, [transactions, isInitialized]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const { balance, monthlyIncome, monthlyExpenses } = useMemo(() => {
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
  }, [transactions]);

  const value = {
    transactions,
    addTransaction,
    balance,
    monthlyIncome,
    monthlyExpenses,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
