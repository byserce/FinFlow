'use client';
import { PageTransition } from "@/components/page-transition";
import { TransactionHistory } from "@/components/history/transaction-history";
import { useTranslation } from "@/hooks/use-translation";

interface HistoryPageProps {
  params: { budgetId: string };
}

export default function HistoryPage({ params }: HistoryPageProps) {
  const { t } = useTranslation();
  return (
    <PageTransition>
      <div className="p-4 md:p-6 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">{t('transactionHistory')}</h1>
          <p className="text-muted-foreground">{t('allYourTransactions')}</p>
        </header>
        <TransactionHistory budgetId={params.budgetId} />
      </div>
    </PageTransition>
  );
}