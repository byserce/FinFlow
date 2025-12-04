'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BalanceCard } from '@/components/dashboard/balance-card';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { AddTransactionSheet } from '@/components/add-transaction-sheet';
import { PageTransition } from '@/components/page-transition';

export default function Home() {
  return (
    <PageTransition>
      <div className="flex flex-col gap-8 p-4 md:p-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Hello there,</p>
            <h1 className="text-2xl font-bold text-foreground">FinFlow User</h1>
          </div>
          <Avatar>
            <AvatarImage src="https://picsum.photos/seed/10/100/100" data-ai-hint="person portrait" />
            <AvatarFallback>FF</AvatarFallback>
          </Avatar>
        </header>

        <BalanceCard />
        <QuickStats />
        <RecentTransactions />
      </div>
      <AddTransactionSheet />
    </PageTransition>
  );
}
