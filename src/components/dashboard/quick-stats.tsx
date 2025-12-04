'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useMemo } from 'react';
import { isThisMonth, parseISO } from 'date-fns';
import type { Budget } from '@/lib/types';


export function QuickStats({ budget }: { budget: Budget }) {
  const { monthlyIncome, monthlyExpenses } = useMemo(() => {
    const currentMonthTransactions = budget.transactions.filter((t) => isThisMonth(parseISO(t.date)));
    
    let income = 0;
    let expenses = 0;
    
    for (const t of currentMonthTransactions) {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expenses += t.amount;
      }
    }

    return { monthlyIncome: income, monthlyExpenses: expenses };
  }, [budget.transactions]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gelir</CardTitle>
          <ArrowUpCircle className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(monthlyIncome)}
          </div>
          <p className="text-xs text-muted-foreground">bu ay</p>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Giderler</CardTitle>
          <ArrowDownCircle className="h-5 w-5 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(monthlyExpenses)}
          </div>
          <p className="text-xs text-muted-foreground">bu ay</p>
        </CardContent>
      </Card>
    </div>
  );
}
