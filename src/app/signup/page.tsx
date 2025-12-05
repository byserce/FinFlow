'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const supabase = createClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('budget_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('emailInUse'),
      });
      setLoading(false);
      return;
    }

    // Create new user
    const newUserId = uuidv4();
    const { error } = await supabase.from('budget_profiles').insert({
      id: newUserId,
      email,
      password, // Storing password in plain text as requested
      display_name: displayName,
      photo_url: `https://picsum.photos/seed/${newUserId}/100/100`
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: t('signupError'),
        description: error.message,
      });
    } else {
      toast({
        title: t('success'),
        description: t('signupSuccess'),
      });
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{' '}
        {t('back')}
      </Link>

      <form
        className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
        onSubmit={handleSignup}
      >
        <label className="text-md" htmlFor="displayName">
          {t('displayNameLabel')}
        </label>
        <Input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="displayName"
          onChange={(e) => setDisplayName(e.target.value)}
          value={displayName}
          placeholder={t('displayNamePlaceholder')}
          required
        />
        <label className="text-md" htmlFor="email">
          {t('emailLabel')}
        </label>
        <Input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="you@example.com"
          required
        />
        <label className="text-md" htmlFor="password">
          {t('passwordLabel')}
        </label>
        <Input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          type="password"
          name="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="••••••••"
          required
        />
        <Button
          variant="default"
          className="rounded-md px-4 py-2 text-foreground mb-2"
          disabled={loading}
        >
          {loading ? t('loading') : t('signup')}
        </Button>
        <Button
          asChild
          variant="outline"
          className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2"
        >
          <Link href="/login">{t('alreadyHaveAccount')}</Link>
        </Button>
      </form>
    </div>
  );
}

    