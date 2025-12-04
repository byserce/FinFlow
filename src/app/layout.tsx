import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/app-provider';
import { Toaster } from '@/components/ui/toaster';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'FinFlow',
  description: 'Kişisel finans yol arkadaşınız.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={cn('font-body antialiased', inter.variable)}>
        <AppProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
