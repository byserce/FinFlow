'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, History, Wallet, Settings } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import React from 'react';
import { useTranslation } from '@/hooks/use-translation';


function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const { t } = useTranslation();

  // Extract budgetId from pathname, e.g., /budget/xyz/analytics -> xyz
  const budgetIdMatch = pathname.match(/budget\/([^/]+)/);
  const budgetId = budgetIdMatch ? budgetIdMatch[1] : null;

  const navItems = [
    // { href: '/', label: 'Bütçeler', icon: Wallet, exact: true }, // Removed from here
    { href: `/budget/${budgetId}`, label: t('overview'), icon: Home, exact: true },
    { href: `/budget/${budgetId}/analytics`, label: t('analysis'), icon: BarChart2 },
    { href: `/budget/${budgetId}/history`, label: t('history'), icon: History },
    { href: `/budget/${budgetId}/settings`, label: t('settings'), icon: Settings },
  ];
  
  const hideOnRoutes = ['/profile'];

  // If we are not in a specific budget, or on a specific page, do not show the nav bar.
  const itemsToShow = budgetId ? navItems : [];
  
  if (!user || itemsToShow.length === 0 || hideOnRoutes.includes(pathname)) {
    return null; // Don't show nav if user is not logged in or no items to show
  }


  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-lg border-t border-border/50 shadow-t-lg md:hidden z-50">
      <div style={{ gridTemplateColumns: `repeat(${itemsToShow.length}, 1fr)`}} className={`grid h-full max-w-lg mx-auto`}>
        {itemsToShow.map((item) => {
          if (!item.href) return null;
          // Updated isActive logic for more precise matching
          let realIsActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            if (item.href === `/budget/${budgetId}` && pathname !== `/budget/${budgetId}`) {
                realIsActive = false;
            }


          return (
            <Link
              key={item.label}
              href={item.href}
              className="inline-flex flex-col items-center justify-center text-center text-muted-foreground hover:text-foreground group"
            >
              <item.icon
                className={cn(
                  'h-6 w-6 mb-1 transition-colors',
                  realIsActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span className={cn(
                'text-xs font-medium transition-colors',
                realIsActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  
  return (
    <div className="relative flex flex-col min-h-screen">
      <main className="flex-1 pb-20 md:pb-0">
        <AnimatePresence mode="wait" initial={false}>
          {children}
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
