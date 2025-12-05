import { AnalyticsView } from "@/components/analytics/analytics-view";
import { PageTransition } from "@/components/page-transition";

interface AnalyticsPageProps {
  params: { budgetId: string };
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  return (
    <PageTransition>
      <AnalyticsView budgetId={params.budgetId} />
    </PageTransition>
  );
}

    