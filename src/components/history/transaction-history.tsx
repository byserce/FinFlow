'use client';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { CategoryIcon } from '@/components/transactions/category-icon';
import { formatCurrency } from '@/lib/utils';
import { Search, Users } from 'lucide-react';
import type { Transaction, Profile } from '@/lib/types';
import { CATEGORY_INFO } from '@/lib/constants';
import { useBudget, useAppContext } from '@/lib/hooks/use-app-context';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';


export function TransactionHistory({ budgetId }: { budgetId: string }) {
  const { budget, isLoading } = useBudget(budgetId);
  const { allProfiles } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  const transactions = budget?.transactions || [];

  const getProfile = (userId: string): Profile | undefined => {
    return allProfiles.find(p => p.id === userId);
  }

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
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

  if (isLoading) {
    return <div className="text-center py-10">İşlem geçmişi yükleniyor...</div>;
  }

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
        {Object.keys(groupedTransactions).length > 0 ? (
          Object.entries(groupedTransactions).map(([day, txs]) => (
            <div key={day}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">{day}</h3>
              <Card className="rounded-2xl shadow-sm">
                <CardContent className="p-4 space-y-4">
                  {txs.map((tx) => {
                    const payerProfile = tx.payer_id ? getProfile(tx.payer_id) : null;
                    return (
                    <div key={tx.id} className="flex items-center">
                      <CategoryIcon category={tx.category} />
                       <div className="ml-4 flex-1">
                          <p className="text-sm font-medium leading-none">{tx.note || CATEGORY_INFO[tx.category]?.label}</p>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            {payerProfile ? (
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={payerProfile.photo_url ?? undefined} />
                                <AvatarFallback>{payerProfile.display_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <Users className="h-4 w-4" />
                            )}
                            <span>{format(parseISO(tx.date), 'h:mm a')}</span>
                          </div>
                        </div>
                      <div className={`font-medium ${tx.type === 'income' ? 'text-green-500' : 'text-foreground'}`}>
                         {tx.type === 'income' ? '+' : '-'}
                         {formatCurrency(tx.amount)}
                      </div>
                    </div>
                  )})}
                </CardContent>
              </Card>
            </div>
          ))
        ) : (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-10">
              <p className="text-center text-muted-foreground">
                {transactions.length === 0 ? 'Kaydedilmiş bir işleminiz yok.' : 'Aramanızla eşleşen işlem bulunamadı.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
