'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpendingChart } from '@/components/analytics/spending-chart';
import { TrendChart } from '@/components/analytics/trend-chart';
import { AiInsights } from '@/components/analytics/ai-insights';
import { useAppContext } from '@/lib/hooks/use-app-context';
import type { Transaction } from '@/lib/types';
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


export function AnalyticsView() {
  const { transactions } = useAppContext();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const filteredTransactions = filterTransactions(transactions, timeRange);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Your financial performance</p>
      </header>

      <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>
        
        <div className="mt-6 space-y-6">
          <SpendingChart transactions={filteredTransactions} />
          <TrendChart transactions={transactions} />
          <AiInsights transactions={transactions} />
        </div>
      </Tabs>
    </div>
  );
}
