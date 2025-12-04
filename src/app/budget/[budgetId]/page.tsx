'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BalanceCard } from '@/components/dashboard/balance-card';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { AddTransactionSheet } from '@/components/add-transaction-sheet';
import { PageTransition } from '@/components/page-transition';
import { User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { useBudget } from '@/lib/hooks/use-app-context';


interface BudgetDashboardPageProps {
  params: { budgetId: string };
}


export default function BudgetDashboardPage({ params }: BudgetDashboardPageProps) {
  const { user } = useUser();
  const { budget, isLoading } = useBudget(params.budgetId);
  
  if (isLoading) {
    return (
        <PageTransition>
            <div className="flex flex-col items-center justify-center h-[80vh] text-center p-4">
                <h1 className="text-2xl font-bold">Bütçe Yükleniyor...</h1>
            </div>
        </PageTransition>
    )
  }

  if (!budget) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center h-[80vh] text-center p-4">
          <h1 className="text-2xl font-bold">Bütçe bulunamadı</h1>
          <p className="text-muted-foreground mt-2">
            Bu bütçe mevcut değil veya silinmiş olabilir.
          </p>
          <Link href="/" passHref>
             <Button variant="link" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Bütçelerime Geri Dön
            </Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-8 p-4 md:p-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground flex items-center">
              <User className="w-4 h-4 mr-2" />
              {budget.name}
            </p>
            <h1 className="text-2xl font-bold text-foreground">Genel Bakış</h1>
          </div>
          <Avatar>
            <AvatarImage src={user?.photo_url ?? undefined} data-ai-hint="person portrait" />
            <AvatarFallback>{user?.display_name?.charAt(0) ?? 'U'}</AvatarFallback>
          </Avatar>
        </header>

        <BalanceCard budget={budget} />
        <QuickStats budget={budget} />
        <RecentTransactions budget={budget} />
      </div>
      <AddTransactionSheet budgetId={budget.id} />
    </PageTransition>
  );
}
