'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { generateFinancialInsights, type FinancialInsightsOutput } from '@/ai/flows/generate-financial-insights';
import { useTranslation } from '@/hooks/use-translation';

interface AiInsightsProps {
  transactions: Transaction[];
}

export function AiInsights({ transactions }: AiInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<FinancialInsightsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleGenerateInsights = async () => {
    setLoading(true);
    setError(null);
    setInsights(null);
    try {
      const result = await generateFinancialInsights({ transactions });
      setInsights(result);
    } catch (e) {
      setError(t('failedToGenerate'));
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="text-accent-foreground" />
          {t('aiInsights')}
        </CardTitle>
        <CardDescription>
          {t('aiInsightsDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!insights && !loading && (
          <Button onClick={handleGenerateInsights} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('generating')}...
              </>
            ) : (
              t('generateInsights')
            )}
          </Button>
        )}

        {loading && (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {error && <p className="text-destructive text-sm">{error}</p>}
        
        {insights && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{t('summary')}</h3>
              <p className="text-sm text-muted-foreground">{insights.summary}</p>
            </div>
            <div>
              <h3 className="font-semibold">{t('keyInsights')}</h3>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-sm text-muted-foreground">
                {insights.insights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
             <Button variant="ghost" size="sm" onClick={handleGenerateInsights} disabled={loading}>
              {t('regenerate')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    