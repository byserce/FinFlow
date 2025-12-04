import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/app-provider';
import { Toaster } from '@/components/ui/toaster';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'FinFlow',
  description: 'Kişisel finans yol arkadaşınız.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let user = session?.user;
  let profile = null;
  let plans = [];
  let transactionsByPlan: { [key: string]: any[] } = {};

  if (user) {
    const { data: userProfile } = await supabase
      .from('budget_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = userProfile;

    const { data: budgetPlans } = await supabase.from('budget_plans').select('*');
    plans = budgetPlans || [];

    if (plans.length > 0) {
      for (const plan of plans) {
        const { data: planTransactions } = await supabase
          .from('budget_transactions')
          .select('*')
          .eq('plan_id', plan.id)
          .order('date', { ascending: false });
        transactionsByPlan[plan.id] = planTransactions || [];
      }
    }
  }

  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={cn('font-body antialiased', inter.variable)}>
        <AppProvider
          user={user}
          profile={profile}
          plans={plans}
          transactionsByPlan={transactionsByPlan}
        >
          <AppShell>{children}</AppShell>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
