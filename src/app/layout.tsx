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
    // 1. Fetch user profile
    const { data: userProfile } = await supabase
      .from('budget_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    profile = userProfile;

    // 2. If profile doesn't exist, create it.
    // This handles the case where a user is in auth.users but not in budget_profiles.
    // This is the single source of truth for profile creation after any signup/login event.
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from('budget_profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            display_name: user.user_metadata.display_name || user.email?.split('@')[0] || 'New User',
            photo_url: user.user_metadata.picture,
          },
        ])
        .select()
        .single();
      
      if (createError) {
        console.error("Critical: Error creating missing profile:", createError);
        // If profile creation fails, we might have to sign out the user
        // or redirect to an error page, as the app won't function correctly.
        // For now, we'll log it and let the app proceed, though it may be in a broken state.
        user = undefined; // Prevents further data fetching for a user without a profile
      } else {
        profile = newProfile;
      }
    }


    // 3. Fetch budget data only if we have a valid profile
    if (profile) {
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
