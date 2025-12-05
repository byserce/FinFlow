'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { CategoryIcon } from '@/components/transactions/category-icon';
import { CATEGORY_INFO } from '@/lib/constants';
import type { Budget, Profile } from '@/lib/types';
import { useMemo } from 'react';
import { useAppContext } from '@/lib/hooks/use-app-context';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Users } from 'lucide-react';


export function RecentTransactions({ budget }: { budget: Budget }) {
  const { allProfiles } = useAppContext();

  const getProfile = (userId: string): Profile | undefined => {
    return allProfiles.find(p => p.id === userId);
  }

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
          {recent.length > 0 ? recent.map((tx) => {
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
                  <span>{format(new Date(tx.date), 'MMM d')}</span>
                </div>
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
          )}) : (
            <p className="text-sm text-muted-foreground text-center">Henüz işlem yok.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
