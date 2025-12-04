'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpendingChart } from '@/components/analytics/spending-chart';
import { TrendChart } from '@/components/analytics/trend-chart';
import { AiInsights } from '@/components/analytics/ai-insights';
import type { Transaction } from '@/lib/types';
import { useBudget } from '@/lib/hooks/use-app-context';
import { isWithinInterval, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

type TimeRange = 'week' | 'month' | 'year';

const filterTransactions = (transactions: Transaction[], range: TimeRange): Transaction[] => {
  const now = new Date();
  let interval;

  switch (range) {
    case 'week':
      interval = { start: startOfWeek(now), end: endOfWeek(now) };
      break;
    case 'month':
      interval = { start: startOfMonth(now), end: endOfMonth(now) };
      break;
    case 'year':
      interval = { start: startOfYear(now), end: endOfYear(now) };
      break;
    default:
      interval = { start: subDays(now, 30), end: now };
  }

  return transactions.filter(tx => isWithinInterval(new Date(tx.date), interval));
};


export function AnalyticsView({ budgetId }: { budgetId: string }) {
  const { budget, isLoading } = useBudget(budgetId);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  if (isLoading) {
     return (
        <div className="p-4 md:p-6 text-center">
            <p>Analiz verileri yükleniyor...</p>
        </div>
    )
  }

  if (!budget) {
    return (
        <div className="p-4 md:p-6 text-center">
            <p>Bütçe bulunamadı veya yükleniyor...</p>
        </div>
    )
  }

  const filteredTransactions = filterTransactions(budget.transactions, timeRange);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Analiz</h1>
        <p className="text-muted-foreground">Finansal performansınız</p>
      </header>

      <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">Hafta</TabsTrigger>
          <TabsTrigger value="month">Ay</TabsTrigger>
          <TabsTrigger value="year">Yıl</TabsTrigger>
        </TabsList>
        
        <div className="mt-6 space-y-6">
          <SpendingChart transactions={filteredTransactions} />
          <TrendChart transactions={budget.transactions} />
          <AiInsights transactions={budget.transactions} />
        </div>
      </Tabs>
    </div>
  );
}
