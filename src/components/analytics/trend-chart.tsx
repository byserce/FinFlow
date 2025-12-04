'use client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/lib/types';
import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

interface TrendChartProps {
  transactions: Transaction[];
}

export function TrendChart({ transactions }: TrendChartProps) {
  const data = useMemo(() => {
    if (transactions.length === 0) return [];
    
    const sortedTransactions = [...transactions].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    
    let balance = 0;
    const balanceHistory: { date: string; balance: number }[] = [];
    
    sortedTransactions.forEach(tx => {
      if (tx.type === 'income') {
        balance += tx.amount;
      } else {
        balance -= tx.amount;
      }
      balanceHistory.push({
        date: format(parseISO(tx.date), 'MMM d'),
        balance: balance
      });
    });

    // To prevent too many data points, we can group by day
    const dailyBalance = balanceHistory.reduce((acc, record) => {
        acc[record.date] = record.balance; // Keep the last balance of the day
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyBalance).map(([date, balance]) => ({ date, balance }));

  }, [transactions]);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>Balance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `$${Number(value) / 1000}k`}
              />
              <Tooltip 
                 formatter={(value: number) => [formatCurrency(value), 'Balance']}
                 contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderRadius: 'var(--radius)',
                    border: '1px solid hsl(var(--border))',
                  }}
              />
              <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        ) : (
           <div className="h-[250px] flex items-center justify-center">
            <p className="text-muted-foreground">Not enough data to show a trend.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
