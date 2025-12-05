'use client';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BalanceCard } from '@/components/dashboard/balance-card';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { AddTransactionSheet } from '@/components/add-transaction-sheet';
import { PageTransition } from '@/components/page-transition';
import { User, ArrowLeft, Wallet, Users, Receipt } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { useBudget, useAppContext } from '@/lib/hooks/use-app-context';
import { DebtSummary } from '@/components/sharing/debt-summary';
import { useTranslation } from '@/hooks/use-translation';

interface BudgetDashboardPageProps {
  params: { budgetId: string };
}

export default function BudgetDashboardPage({ params }: BudgetDashboardPageProps) {
  const { user } = useUser();
  const { budget, isLoading } = useBudget(params.budgetId);
  const { allProfiles } = useAppContext();
  const { t } = useTranslation();
  
  const currentUserMember = budget?.members.find(m => m.user_id === user?.id);
  const canEdit = currentUserMember?.role === 'owner' || currentUserMember?.role === 'editor';

  if (isLoading) {
    return (
        <PageTransition>
            <div className="flex flex-col items-center justify-center h-[80vh] text-center p-4">
                <h1 className="text-2xl font-bold">{t('budgetLoading')}</h1>
            </div>
        </PageTransition>
    )
  }

  if (!budget) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center h-[80vh] text-center p-4">
          <h1 className="text-2xl font-bold">{t('budgetNotFound')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('budgetNotFoundDescription')}
          </p>
          <Link href="/" passHref>
             <Button variant="link" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('backToBudgets')}
            </Button>
          </Link>
        </div>
      </PageTransition>
    );
  }
  
  const acceptedMembers = budget.members.filter(m => m.status === 'accepted');
  const isSharingMode = budget.mode === 'sharing';
  
  const getIcon = () => {
    if (budget.mode === 'sharing') return <Receipt className="w-4 h-4 mr-2" />;
    if (acceptedMembers.length > 1) return <Users className="w-4 h-4 mr-2" />;
    return <User className="w-4 h-4 mr-2" />;
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-8 p-4 md:p-6">
        <header className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" passHref>
              <Button variant="outline" size="icon" aria-label={t('backToBudgets')}>
                <Wallet className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <p className="text-sm text-muted-foreground flex items-center">
                 {getIcon()}
                {budget.name}
              </p>
              <h1 className="text-2xl font-bold text-foreground">
                {isSharingMode ? t('debtStatus') : t('overview')}
              </h1>
            </div>
          </div>
          <div className="flex items-center -space-x-2">
             {acceptedMembers.slice(0, 3).map(member => {
                 const profile = allProfiles.find(p => p.id === member.user_id);
                 return (
                    <Avatar key={member.user_id}>
                        <AvatarImage src={profile?.photo_url ?? undefined} />
                        <AvatarFallback>{profile?.display_name?.charAt(0) ?? '?'}</AvatarFallback>
                    </Avatar>
                 )
             })}
             {acceptedMembers.length > 3 && (
                <Avatar>
                    <AvatarFallback>+{acceptedMembers.length - 3}</AvatarFallback>
                </Avatar>
             )}
          </div>
        </header>
        
        {isSharingMode ? (
            <DebtSummary budget={budget} />
        ) : (
            <>
                <BalanceCard budget={budget} />
                <QuickStats budget={budget} />
            </>
        )}

        <RecentTransactions budget={budget} />
      </div>
      {canEdit && <AddTransactionSheet budgetId={budget.id} />}
    </PageTransition>
  );
}

    