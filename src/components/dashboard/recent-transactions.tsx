'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { CategoryIcon } from '@/components/transactions/category-icon';
import { CATEGORY_INFO } from '@/lib/constants';
import type { Budget } from '@/lib/types';
import { useMemo } from 'react';

export function RecentTransactions({ budget }: { budget: Budget }) {
  const recent = useMemo(() => {
     return [...budget.transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [budget.transactions]);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>Son İşlemler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recent.length > 0 ? recent.map((tx) => (
            <div key={tx.id} className="flex items-center">
              <CategoryIcon category={tx.category} />
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium leading-none">{tx.note || CATEGORY_INFO[tx.category]?.label}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(tx.date), 'MMM d, yyyy')}
                </p>
              </div>
              <div
                className={`font-medium ${
                  tx.type === 'income' ? 'text-green-500' : 'text-foreground'
                }`}
              >
                {tx.type === 'income' ? '+' : '-'}
                {formatCurrency(tx.amount)}
              </div>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground text-center">Henüz işlem yok.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
