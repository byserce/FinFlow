'use client';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { handleGoogleLogin } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { useUser } from '@/hooks/use-user';
import { useEffect } from 'react';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface GoogleJwtPayload {
  email: string;
  name: string;
  picture: string;
}

function LoginScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { login, user } = useUser();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const performLogin = async (accessToken: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch user info from Google.');
      }
      const userInfo: GoogleJwtPayload = await res.json();
      
      const result = await handleGoogleLogin(userInfo.email, userInfo.name, userInfo.picture);

      if (result.error) {
        toast({ variant: 'destructive', title: t('error'), description: result.error });
        return;
      }
      
      if(result.user) {
        login(result.user);
        toast({ title: t('success'), description: t('loginSuccess') });
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Login processing error:', error);
      toast({ variant: 'destructive', title: t('error'), description: (error as Error).message });
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => performLogin(tokenResponse.access_token),
    onError: () => {
      toast({ variant: 'destructive', title: t('error'), description: 'Google login failed. Please try again.' });
    },
    useOneTap: false,
  });

  return (
    <div className="flex h-screen flex-col bg-background p-8 overflow-hidden">
        {/* Main content area that fills available space */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Image src="/logo.png" alt="FinFlow Logo" width={128} height={128} className="mx-auto mb-6 rounded-3xl shadow-lg" />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h1 className="text-4xl font-bold tracking-tighter">{t('welcome')}</h1>
                <p className="text-muted-foreground mt-2 text-lg">{t('manageBudgets')}</p>
            </motion.div>
        </div>

        {/* Bottom button area */}
        <motion.div
            className="w-full max-w-sm mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <Button
                size="lg"
                className="w-full h-14 text-lg rounded-2xl bg-white text-gray-800 hover:bg-gray-100 shadow-md"
                onClick={() => googleLogin()}
            >
                <FcGoogle className="mr-4 h-7 w-7" />
                Sign in with Google
            </Button>
        </motion.div>
    </div>
  );
}


export default function LoginPage() {
  const { t } = useTranslation();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return (
      <div className="flex-1 flex flex-col w-full h-screen px-8 sm:max-w-md justify-center gap-4 items-center text-center">
         <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
         <p className="text-muted-foreground">
            The Google Client ID is missing. Please set the <code className="bg-muted px-1 py-0.5 rounded-sm">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> environment variable.
        </p>
      </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
        <LoginScreen />
    </GoogleOAuthProvider>
  );
}
