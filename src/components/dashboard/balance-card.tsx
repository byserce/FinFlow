'use client';
import { Card, CardContent } from '@/components/ui/card';
import { useAppContext } from '@/lib/hooks/use-app-context';
import { formatCurrency } from '@/lib/utils';
import { Wallet } from 'lucide-react';

export function BalanceCard() {
  const { balance } = useAppContext();

  return (
    <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-primary/80 to-accent/80 text-primary-foreground overflow-hidden">
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div>
          <p className="text-sm font-medium opacity-80 flex items-center">
            <Wallet className="w-4 h-4 mr-2" /> Total Balance
          </p>
          <p className="text-4xl font-bold tracking-tighter mt-2">
            {formatCurrency(balance)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
