'use client';
import { AnalyticsView } from "@/components/analytics/analytics-view";
import { PageTransition } from "@/components/page-transition";
import type { Budget } from "@/lib/types";

interface AnalyticsPageProps {
  budgets: Budget[];
  params: { budgetId: string };
}

export default function AnalyticsPage({ budgets = [], params }: AnalyticsPageProps) {
  const budget = budgets.find(b => b.id === params.budgetId);
  
  return (
    <PageTransition>
      <AnalyticsView budget={budget} />
    </PageTransition>
  );
}
