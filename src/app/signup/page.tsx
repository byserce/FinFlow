'use client';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';

export default function SignupPage() {
  const handleSignup = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 items-center">
       <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">FinFlow'a Katılın</h1>
        <p className="text-muted-foreground">Tek tıkla bütçe yönetimine başlayın.</p>
      </div>
      <Button
        variant="outline"
        className="w-full h-12 text-lg"
        onClick={handleSignup}
      >
        <FcGoogle className="mr-4 h-6 w-6" />
        Google ile Kaydol
      </Button>
    </div>
  );
}
