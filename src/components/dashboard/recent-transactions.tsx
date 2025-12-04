'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/lib/hooks/use-app-context';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { CategoryIcon } from '@/components/transactions/category-icon';
import { CATEGORY_INFO } from '@/lib/constants';

export function RecentTransactions() {
  const { transactions } = useAppContext();
  const recent = transactions.slice(0, 5);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recent.map((tx) => (
            <div key={tx.id} className="flex items-center">
              <CategoryIcon category={tx.category} />
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium leading-none">{tx.note || CATEGORY_INFO[tx.category].label}</p>
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
          ))}
          {transactions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">No transactions yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
