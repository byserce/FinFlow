'use client';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { CategoryIcon } from '@/components/transactions/category-icon';
import { formatCurrency } from '@/lib/utils';
import { Search, Users, Trash2 } from 'lucide-react';
import type { Transaction, Profile } from '@/lib/types';
import { CATEGORY_INFO } from '@/lib/constants';
import { useBudget, useAppContext } from '@/lib/hooks/use-app-context';
import { useUser } from '@/hooks/use-user';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { deleteTransaction } from '@/app/actions';

export function TransactionHistory({ budgetId }: { budgetId: string }) {
  const { user } = useUser();
  const { budget, isLoading } = useBudget(budgetId);
  const { allProfiles, refetch } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const transactions = useMemo(() => 
    [...(budget?.transactions || [])].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
    [budget?.transactions]
  );
  
  const currentUserMember = useMemo(() => 
    budget?.members.find(m => m.user_id === user?.id),
    [budget?.members, user?.id]
  );
  const canEdit = currentUserMember?.role === 'owner' || currentUserMember?.role === 'editor';

  const getProfile = (userId: string): Profile | undefined => {
    return allProfiles.find(p => p.id === userId);
  }
  
  const handleDelete = async (transactionId: string) => {
    if (!user) return;
    const result = await deleteTransaction(transactionId, budgetId, user.id);
    if(result.error) {
      toast({ variant: 'destructive', title: 'Hata', description: result.error });
    } else {
      toast({ title: 'Başarılı', description: 'İşlem silindi.'});
      await refetch();
    }
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
                <CardContent className="p-0">
                  <div className="divide-y">
                    {txs.map((tx) => {
                      const payerProfile = tx.payer_id ? getProfile(tx.payer_id) : null;
                      return (
                      <div key={tx.id} className="flex items-center p-4 group">
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
                        <div className={`font-medium mr-4 ${tx.type === 'income' ? 'text-green-500' : 'text-foreground'}`}>
                           {tx.type === 'income' ? '+' : '-'}
                           {formatCurrency(tx.amount)}
                        </div>
                        {canEdit && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="h-4 w-4" />
                               </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bu eylem geri alınamaz. Bu işlem kalıcı olarak silinecektir.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(tx.id)}>
                                  Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    )})}
                   </div>
                </CardContent>
              </Card>
            </div>
          ))
        ) : (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-10">
              <p className="text-center text-muted-foreground">
                {(transactions || []).length === 0 ? 'Kaydedilmiş bir işleminiz yok.' : 'Aramanızla eşleşen işlem bulunamadı.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
