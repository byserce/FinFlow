'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('budget_profiles')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('invalidCredentials'),
      });
    } else {
      localStorage.setItem('active_user', JSON.stringify(data));
      toast({
        title: t('success'),
        description: t('loginSuccess'),
      });
      router.push('/');
      router.refresh(); // Force a refresh to reload context
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
        onSubmit={handleLogin}
      >
        <label className="text-md" htmlFor="email">
          {t('emailLabel')}
        </label>
        <Input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
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
          {loading ? t('loading') : t('login')}
        </Button>
        <Button
          asChild
          variant="outline"
          className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2"
        >
          <Link href="/signup">{t('noAccount')}</Link>
        </Button>
      </form>
    </div>
  );
}

    