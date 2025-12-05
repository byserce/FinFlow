import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { AppProvider } from '@/context/app-provider';
import { AppShell } from '@/components/app-shell';
import { LanguageProvider } from '@/context/language-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'FinFlow',
  description: 'Kişisel finans yol arkadaşınız. | Your personal finance companion.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={cn('font-body antialiased', inter.variable)}>
        <LanguageProvider>
          <AppProvider>
            <AppShell>{children}</AppShell>
          </AppProvider>
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}

    