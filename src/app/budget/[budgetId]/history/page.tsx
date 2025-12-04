'use client';
import { PageTransition } from "@/components/page-transition";
import { TransactionHistory } from "@/components/history/transaction-history";
import type { Budget } from "@/lib/types";

interface HistoryPageProps {
  budgets: Budget[];
  params: { budgetId: string };
}

export default function HistoryPage({ budgets = [], params }: HistoryPageProps) {
  const budget = budgets.find(b => b.id === params.budgetId);

  return (
    <PageTransition>
      <div className="p-4 md:p-6 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Geçmiş</h1>
          <p className="text-muted-foreground">Tüm işlem dökümünüz</p>
        </header>
        <TransactionHistory budget={budget} />
      </div>
    </PageTransition>
  );
}
