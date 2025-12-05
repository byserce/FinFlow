'use client';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Wallet } from 'lucide-react';
import type { Budget } from '@/lib/types';
import { useMemo } from 'react';
import { useTranslation } from '@/hooks/use-translation';

export function BalanceCard({ budget }: { budget: Budget }) {
  const { t } = useTranslation();
  const balance = useMemo(() => {
    return budget.transactions.reduce((acc, tx) => {
      if (tx.type === 'income') {
        return acc + tx.amount;
      }
      return acc - tx.amount;
    }, 0);
  }, [budget.transactions]);


  return (
    <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-primary/80 to-accent/80 text-primary-foreground overflow-hidden">
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div>
          <p className="text-sm font-medium opacity-80 flex items-center">
            <Wallet className="w-4 h-4 mr-2" /> {t('totalBalance')}
          </p>
          <p className="text-4xl font-bold tracking-tighter mt-2">
            {formatCurrency(balance, budget.currency)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
