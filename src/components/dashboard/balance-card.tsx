'use client';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Wallet } from 'lucide-react';
import type { Budget } from '@/lib/types';

export function BalanceCard({ budget }: { budget: Budget }) {

  return (
    <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-primary/80 to-accent/80 text-primary-foreground overflow-hidden">
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div>
          <p className="text-sm font-medium opacity-80 flex items-center">
            <Wallet className="w-4 h-4 mr-2" /> Toplam Bakiye
          </p>
          <p className="text-4xl font-bold tracking-tighter mt-2">
            {formatCurrency(budget.balance)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
