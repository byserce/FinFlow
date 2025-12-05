'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes('Unsupported provider')) {
        setError("Google ile kimlik doğrulama bu projede etkinleştirilmemiş. Lütfen Supabase projenizin 'Authentication > Providers' bölümüne gidip Google'ı etkinleştirin.");
      } else {
        setError(`Bir hata oluştu: ${error.message}`);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-4 items-center">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold">FinFlow'a Hoş Geldiniz</h1>
        <p className="text-muted-foreground">Başlamak için giriş yapın veya kaydolun.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Giriş Hatası</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        variant="outline"
        className="w-full h-12 text-lg"
        onClick={handleLogin}
      >
        <FcGoogle className="mr-4 h-6 w-6" />
        Google ile Giriş Yap
      </Button>
    </div>
  );
}
