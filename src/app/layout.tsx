import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { AppProvider } from '@/context/app-provider';
import { AppShell } from '@/components/app-shell';
import { LanguageProvider } from '@/context/language-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'FinFlow | Kişisel Bütçe ve Gider Takibi',
  description: 'FinFlow, kişisel finansınızı yönetmek, bütçelerinizi oluşturmak, gelir ve giderlerinizi takip etmek ve arkadaşlarınızla harcamaları kolayca bölüşmek için modern bir web uygulamasıdır.',
  keywords: ['bütçe', 'gider takibi', 'finans', 'para yönetimi', 'harcama paylaşımı', 'budget', 'expense tracker', 'finance', 'money management'],
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/logo.png',
        href: '/logo.png',
        type: 'image/png',
        sizes: '32x32',
      },
    ],
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
