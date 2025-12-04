import { PageTransition } from "@/components/page-transition";
import { TransactionHistory } from "@/components/history/transaction-history";

interface HistoryPageProps {
  params: { budgetId: string };
}

export default function HistoryPage({ params }: HistoryPageProps) {
  return (
    <PageTransition>
      <div className="p-4 md:p-6 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Geçmiş</h1>
          <p className="text-muted-foreground">Tüm işlem dökümünüz</p>
        </header>
        <TransactionHistory budgetId={params.budgetId} />
      </div>
    </PageTransition>
  );
}
