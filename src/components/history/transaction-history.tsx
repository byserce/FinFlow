'use client';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { CategoryIcon } from '@/components/transactions/category-icon';
import { formatCurrency } from '@/lib/utils';
import { Search, Users, Trash2, ChevronDown } from 'lucide-react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

export function TransactionHistory({ budgetId }: { budgetId: string }) {
  const { user } = useUser();
  const { budget, isLoading } = useBudget(budgetId);
  const { allProfiles, transactionParticipants, refetch } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [openCollapsibleId, setOpenCollapsibleId] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const transactions = useMemo(() => 
    [...(budget?.transactions || [])].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
    [budget?.transactions]
  );
  
  const currentUserMember = useMemo(() => 
    budget?.members.find(m => m.user_id === user?.id),
    [budget?.members, user?.id]
  );
  const canEdit = currentUserMember?.role === 'owner' || currentUserMember?.role === 'editor';
  const isSharingMode = budget?.mode === 'sharing';

  const getProfile = (userId: string): Profile | undefined => {
    return allProfiles.find(p => p.id === userId);
  }
  
  const handleDelete = async (transactionId: string) => {
    if (!user) return;
    const result = await deleteTransaction(transactionId, budgetId, user.id);
    if(result.error) {
      toast({ variant: 'destructive', title: t('error'), description: result.error });
    } else {
      toast({ title: t('success'), description: t('transactionDeleteSuccess')});
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
        dayLabel = t('today');
      } else if (isYesterday(date)) {
        dayLabel = t('yesterday');
      } else {
        dayLabel = format(date, 'd MMMM yyyy');
      }

      if (!acc[dayLabel]) {
        acc[dayLabel] = [];
      }
      acc[dayLabel].push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [filteredTransactions, t]);
  
  if (isLoading) {
    return <div className="text-center py-10">{t('loadingHistory')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder={t('searchTransactions')}
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
                      const participants = transactionParticipants.filter(p => p.transaction_id === tx.id);
                      const showParticipants = isSharingMode && participants.length > 0;

                      return (
                        <Collapsible key={tx.id} open={openCollapsibleId === tx.id} onOpenChange={() => setOpenCollapsibleId(openCollapsibleId === tx.id ? null : tx.id)}>
                          <div className="flex items-center p-4 group">
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
                            <div className={`font-medium mr-2 ${tx.type === 'income' ? 'text-green-500' : 'text-foreground'}`}>
                               {tx.type === 'income' ? '+' : '-'}
                               {formatCurrency(tx.amount)}
                            </div>
                            <div className='flex items-center'>
                              {canEdit && (
                                <AlertDialog onOpenChange={(open) => !open && event.stopPropagation()} >
                                  <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {t('deleteTransactionWarning')}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(tx.id)}>
                                        {t('delete')}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              {showParticipants && (
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="icon" className='h-8 w-8 ml-1'>
                                      <ChevronDown className={cn("h-4 w-4 transition-transform", openCollapsibleId === tx.id && "rotate-180")} />
                                  </Button>
                                </CollapsibleTrigger>
                              )}
                             </div>
                          </div>
                           {showParticipants && (
                            <CollapsibleContent className="px-4 pb-4">
                               <div className="border-t pt-3 mt-1">
                                <h4 className='text-xs font-semibold text-muted-foreground mb-2'>{t('participants')}</h4>
                                <div className="flex flex-wrap gap-2">
                                  {participants.map(p => {
                                    const participantProfile = getProfile(p.user_id);
                                    if (!participantProfile) return null;
                                    return (
                                      <div key={p.user_id} className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-full">
                                        <Avatar className="h-5 w-5">
                                          <AvatarImage src={participantProfile.photo_url ?? undefined} />
                                          <AvatarFallback>{participantProfile.display_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className='text-xs font-medium'>{participantProfile.display_name}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                               </div>
                            </CollapsibleContent>
                          )}
                        </Collapsible>
                      )
                    })}
                   </div>
                </CardContent>
              </Card>
            </div>
          ))
        ) : (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-10">
              <p className="text-center text-muted-foreground">
                {(transactions || []).length === 0 ? t('noSavedTransactions') : t('noMatchingTransactions')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

    