import { AnalyticsView } from "@/components/analytics/analytics-view";
import { PageTransition } from "@/components/page-transition";

export default function AnalyticsPage() {
  return (
    <PageTransition>
      <AnalyticsView />
    </PageTransition>
  );
}
