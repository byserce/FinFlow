import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/app-provider';
import { Toaster } from '@/components/ui/toaster';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { mockTransactions } from '@/lib/data';

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

  const plans = [{
    id: '1',
    name: 'Personal Budget',
    owner_id: '1',
    created_at: new Date().toISOString()
  }];

  const transactionsByPlan = {
    '1': mockTransactions
  }


  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={cn('font-body antialiased', inter.variable)}>
        <AppProvider
          user={null}
          profile={null}
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
