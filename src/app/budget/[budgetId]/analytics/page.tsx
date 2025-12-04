import { AnalyticsView } from "@/components/analytics/analytics-view";
import { PageTransition } from "@/components/page-transition";

export default function AnalyticsPage({ params }: { params: { budgetId: string }}) {
  return (
    <PageTransition>
      <AnalyticsView budgetId={params.budgetId} />
    </PageTransition>
  );
}
