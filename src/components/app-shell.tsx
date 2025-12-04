'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, History, Wallet } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import React from 'react';


function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();

  // Extract budgetId from pathname, e.g., /budget/xyz/analytics -> xyz
  const budgetIdMatch = pathname.match(/budget\/([^/]+)/);
  const budgetId = budgetIdMatch ? budgetIdMatch[1] : null;

  const navItems = [
    { href: '/', label: 'Bütçeler', icon: Wallet, exact: true },
    { href: `/budget/${budgetId}`, label: 'Genel Bakış', icon: Home },
    { href: `/budget/${budgetId}/analytics`, label: 'Analiz', icon: BarChart2 },
    { href: `/budget/${budgetId}/history`, label: 'Geçmiş', icon: History },
  ];

  // If we are not in a specific budget, only show the Budgets link
  const itemsToShow = budgetId ? navItems : [navItems[0]];
  
  if (!user) {
    return null; // Don't show nav if user is not logged in
  }


  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-lg border-t border-border/50 shadow-t-lg md:hidden z-50">
      <div className={`grid h-full max-w-lg mx-auto grid-cols-${itemsToShow.length}`}>
        {itemsToShow.map((item) => {
          if (!item.href) return null;
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== '/';
          return (
            <Link
              key={item.label}
              href={item.href}
              className="inline-flex flex-col items-center justify-center text-center text-muted-foreground hover:text-foreground group"
            >
              <item.icon
                className={cn(
                  'h-6 w-6 mb-1 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span className={cn(
                'text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
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
