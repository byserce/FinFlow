'use client';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAppContext } from '@/lib/hooks/use-app-context';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { CategoryIcon } from '@/components/transactions/category-icon';
import { formatCurrency } from '@/lib/utils';
import { Search } from 'lucide-react';
import type { Transaction } from '@/lib/types';


export function TransactionHistory() {
  const { transactions } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (tx) =>
        tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.amount.toString().includes(searchTerm)
    );
  }, [transactions, searchTerm]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      const date = parseISO(tx.date);
      let dayLabel: string;

      if (isToday(date)) {
        dayLabel = 'Today';
      } else if (isYesterday(date)) {
        dayLabel = 'Yesterday';
      } else {
        dayLabel = format(date, 'MMMM d, yyyy');
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
          placeholder="Search transactions..."
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
                      <p className="text-sm font-medium leading-none">{tx.note || tx.category}</p>
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
              <p className="text-center text-muted-foreground">You have no transactions recorded.</p>
            </CardContent>
          </Card>
        )}
         {transactions.length > 0 && Object.keys(groupedTransactions).length === 0 && (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-10">
              <p className="text-center text-muted-foreground">No transactions match your search.</p>
            </CardContent>
          </Card>
         )}
      </div>
    </div>
  );
}
