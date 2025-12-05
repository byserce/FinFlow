'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { Budget, Debt, Profile } from '@/lib/types';
import { useAppContext } from '@/lib/hooks/use-app-context';
import { Scale, Users, ArrowRight, Minus, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const calculateDebts = (budget: Budget): { debts: Debt[], balances: { [key: string]: number }, totalSpending: number } => {
  const members = budget.members.filter(m => m.status === 'accepted');
  if (members.length < 2) {
    return { debts: [], balances: {}, totalSpending: 0 };
  }

  const memberIds = members.map(m => m.user_id);

  const spendingByUser: { [key: string]: number } = {};
  memberIds.forEach(id => spendingByUser[id] = 0);

  let totalSpending = 0;
  budget.transactions.forEach(tx => {
    if (tx.type === 'expense' && tx.payer_id && memberIds.includes(tx.payer_id)) {
      spendingByUser[tx.payer_id] += tx.amount;
      totalSpending += tx.amount;
    }
  });

  const sharePerPerson = totalSpending / members.length;
  
  const balances: { [key: string]: number } = {};
  memberIds.forEach(id => {
    balances[id] = spendingByUser[id] - sharePerPerson;
  });

  const debtors = Object.entries(balances).filter(([, balance]) => balance < 0).map(([id, balance]) => ({ id, amount: -balance }));
  const creditors = Object.entries(balances).filter(([, balance]) => balance > 0).map(([id, balance]) => ({ id, amount: balance }));
  
  const debts: Debt[] = [];

  debtors.forEach(debtor => {
    let amountOwed = debtor.amount;
    creditors.forEach(creditor => {
      if (amountOwed <= 0 || creditor.amount <= 0) return;

      const amountToTransfer = Math.min(amountOwed, creditor.amount);

      debts.push({
        from: debtor.id,
        to: creditor.id,
        amount: amountToTransfer
      });

      amountOwed -= amountToTransfer;
      creditor.amount -= amountToTransfer;
    });
  });

  return { debts, balances, totalSpending };
};


export function DebtSummary({ budget }: { budget: Budget }) {
    const { allProfiles } = useAppContext();
    const getProfile = (userId: string): Profile | undefined => allProfiles.find(p => p.id === userId);

    const { debts, balances, totalSpending } = useMemo(() => calculateDebts(budget), [budget]);
    const acceptedMembers = budget.members.filter(m => m.status === 'accepted');

    return (
        <div className="space-y-6">
             <Card className="rounded-2xl shadow-sm">
                <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center gap-2 text-base font-medium text-muted-foreground'>
                        <Scale className='w-4 h-4' /> Toplam Harcama
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{formatCurrency(totalSpending)}</p>
                    <p className="text-xs text-muted-foreground">Kişi başı düşen: {formatCurrency(totalSpending / (acceptedMembers.length || 1))}</p>
                </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Kim Kime Borçlu?</CardTitle>
                    <CardDescription>Hesaplanan borç ve alacak durumu.</CardDescription>
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
                                    <span className='font-bold text-destructive'>{formatCurrency(debt.amount)}</span>
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
                            {acceptedMembers.length < 2 ? "Borç hesabı için en az 2 üye olmalıdır." : "Henüz kimsenin kimseye borcu yok. Herkes heasbını ödemiş."}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle className='text-lg'>Net Bakiye Durumu</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="space-y-3">
                        {Object.entries(balances).map(([userId, balance]) => {
                             const profile = getProfile(userId);
                             if (!profile) return null;
                             const isCreditor = balance > 0;
                             return (
                                <div key={userId} className="flex items-center justify-between">
                                    <div className='flex items-center gap-3'>
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={profile.photo_url ?? undefined} />
                                            <AvatarFallback>{profile.display_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className='font-medium'>{profile.display_name}</span>
                                    </div>
                                    <div className={`flex items-center font-bold ${isCreditor ? 'text-green-500' : 'text-destructive'}`}>
                                        {isCreditor ? <Plus className='w-4 h-4 mr-1'/> : <Minus className='w-4 h-4 mr-1'/>}
                                        {formatCurrency(Math.abs(balance))}
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
