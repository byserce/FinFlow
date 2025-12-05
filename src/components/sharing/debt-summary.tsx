'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { Budget, Debt, Profile, TransactionParticipant } from '@/lib/types';
import { useAppContext } from '@/lib/hooks/use-app-context';
import { Scale, Users, ArrowRight, Minus, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/use-translation';


const calculateDebts = (budget: Budget, participants: TransactionParticipant[]): { debts: Debt[], balances: { [key: string]: number }, totalSpending: number } => {
  const members = budget.members.filter(m => m.status === 'accepted');
  if (members.length === 0) {
    return { debts: [], balances: {}, totalSpending: 0 };
  }
  const memberIds = members.map(m => m.user_id);
  const balances: { [key: string]: number } = {};
  memberIds.forEach(id => balances[id] = 0);
  let totalSpending = 0;

  budget.transactions.forEach(tx => {
    if (tx.type !== 'expense' || !tx.payer_id || !memberIds.includes(tx.payer_id)) return;
    
    totalSpending += tx.amount;
    
    const txParticipants = participants.filter(p => p.transaction_id === tx.id);
    const participantUserIds = txParticipants.map(p => p.user_id);

    // If no participants are recorded for this transaction, assume it's split among all members
    const splitBetween = participantUserIds.length > 0 ? participantUserIds : memberIds;
    
    if (splitBetween.length === 0) return;

    const sharePerPerson = tx.amount / splitBetween.length;

    // Add to payer's balance
    balances[tx.payer_id] += tx.amount;

    // Subtract from each participant's balance
    splitBetween.forEach(userId => {
      if (balances[userId] !== undefined) {
        balances[userId] -= sharePerPerson;
      }
    });
  });

  const debtors = Object.entries(balances).filter(([, balance]) => balance < 0).map(([id, balance]) => ({ id, amount: -balance }));
  const creditors = Object.entries(balances).filter(([, balance]) => balance > 0).map(([id, balance]) => ({ id, amount: balance }));
  
  const debts: Debt[] = [];

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let debtorIndex = 0;
  let creditorIndex = 0;

  while(debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amountToTransfer = Math.min(debtor.amount, creditor.amount);

    if (amountToTransfer > 0.01) { // Avoid tiny floating point debts
        debts.push({
            from: debtor.id,
            to: creditor.id,
            amount: amountToTransfer
        });

        debtor.amount -= amountToTransfer;
        creditor.amount -= amountToTransfer;
    }

    if (debtor.amount < 0.01) {
        debtorIndex++;
    }
    if (creditor.amount < 0.01) {
        creditorIndex++;
    }
  }

  return { debts, balances, totalSpending };
};


export function DebtSummary({ budget }: { budget: Budget }) {
    const { allProfiles, transactionParticipants, isLoading } = useAppContext();
    const { t, language } = useTranslation();
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';

    const getProfile = (userId: string): Profile | undefined => allProfiles.find(p => p.id === userId);

    const { debts, balances, totalSpending } = useMemo(() => {
        if (isLoading) return { debts: [], balances: {}, totalSpending: 0 };
        return calculateDebts(budget, transactionParticipants)
    }, [budget, transactionParticipants, isLoading]);

    const acceptedMembers = budget.members.filter(m => m.status === 'accepted');

    if (isLoading) {
        return <p>{t('loading')}...</p>
    }

    return (
        <div className="space-y-6">
             <Card className="rounded-2xl shadow-sm">
                <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center gap-2 text-base font-medium text-muted-foreground'>
                        <Scale className='w-4 h-4' /> {t('totalSpending')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{formatCurrency(totalSpending, budget.currency, locale)}</p>
                </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">{t('whoOwesWhom')}</CardTitle>
                    <CardDescription>{t('debtSummaryDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {debts.length > 0 ? (
                        <div className="space-y-4">
                        {debts.map((debt, index) => {
                            const fromUser = getProfile(debt.from);
                            const toUser = getProfile(debt.to);
                            if (!fromUser || !toUser) return null;

                            return (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={fromUser.photo_url ?? undefined} />
                                    <AvatarFallback>{fromUser.display_name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{fromUser.display_name}</span>
                                </div>
                                
                                <div className="flex flex-col items-center text-center">
                                    <span className='font-bold text-destructive'>{formatCurrency(debt.amount, budget.currency, locale)}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>

                                <div className="flex items-center gap-2">
                                <span className="font-medium">{toUser.display_name}</span>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={toUser.photo_url ?? undefined} />
                                    <AvatarFallback>{toUser.display_name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                </div>
                            </div>
                            );
                        })}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-4">
                            {acceptedMembers.length < 2 ? t('atLeastTwoMembers') : t('noDebts')}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle className='text-lg'>{t('netBalance')}</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="space-y-3">
                        {Object.entries(balances).map(([userId, balance]) => {
                             const profile = getProfile(userId);
                             if (!profile) return null;
                             const isCreditor = balance > 0;
                             const isDebtor = balance < 0;
                             return (
                                <div key={userId} className="flex items-center justify-between">
                                    <div className='flex items-center gap-3'>
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={profile.photo_url ?? undefined} />
                                            <AvatarFallback>{profile.display_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className='font-medium'>{profile.display_name}</span>
                                    </div>
                                    <div className={`flex items-center font-bold ${isCreditor ? 'text-green-500' : isDebtor ? 'text-destructive' : 'text-muted-foreground'}`}>
                                        {isCreditor ? <Plus className='w-4 h-4 mr-1'/> : isDebtor ? <Minus className='w-4 h-4 mr-1'/> : null}
                                        {formatCurrency(Math.abs(balance), budget.currency, locale)}
                                    </div>
                                </div>
                             )
                        })}
                     </div>
                </CardContent>
            </Card>
        </div>
    )
}
