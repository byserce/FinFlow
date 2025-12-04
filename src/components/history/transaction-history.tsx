'use client';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useBudget } from '@/lib/hooks/use-app-context';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { CategoryIcon } from '@/components/transactions/category-icon';
import { formatCurrency } from '@/lib/utils';
import { Search } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { CATEGORY_INFO } from '@/lib/constants';


export function TransactionHistory({ budgetId }: { budgetId: string }) {
  const { budget } = useBudget(budgetId);
  const transactions = budget?.transactions || [];
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (tx) =>
        CATEGORY_INFO[tx.category]?.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.amount.toString().includes(searchTerm)
    );
  }, [transactions, searchTerm]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      const date = parseISO(tx.date);
      let dayLabel: string;

      if (isToday(date)) {
        dayLabel = 'Bugün';
      } else if (isYesterday(date)) {
        dayLabel = 'Dün';
      } else {
        dayLabel = format(date, 'd MMMM yyyy');
      }

      if (!acc[dayLabel]) {
        acc[dayLabel] = [];
      }
      acc[dayLabel].push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [filteredTransactions]);


  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="İşlemlerde ara..."
          className="pl-10 h-12 rounded-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTransactions).map(([day, txs]) => (
          <div key={day}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">{day}</h3>
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-4 space-y-4">
                {txs.map((tx) => (
                  <div key={tx.id} className="flex items-center">
                    <CategoryIcon category={tx.category} />
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium leading-none">{tx.note || CATEGORY_INFO[tx.category]?.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(tx.date), 'h:mm a')}
                      </p>
                    </div>
                    <div className={`font-medium ${tx.type === 'income' ? 'text-green-500' : 'text-foreground'}`}>
                       {tx.type === 'income' ? '+' : '-'}
                       {formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
         {transactions.length === 0 && (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-10">
              <p className="text-center text-muted-foreground">Kaydedilmiş bir işleminiz yok.</p>
            </CardContent>
          </Card>
        )}
         {transactions.length > 0 && Object.keys(groupedTransactions).length === 0 && (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-10">
              <p className="text-center text-muted-foreground">Aramanızla eşleşen işlem bulunamadı.</p>
            </CardContent>
          </Card>
         )}
      </div>
    </div>
  );
}
