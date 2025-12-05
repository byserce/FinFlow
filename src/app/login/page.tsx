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
    <div className="flex h-screen w-full items-center justify-center bg-background p-6 sm:p-8">
        <div className="w-full max-w-sm text-center">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="mb-8"
            >
                <div className="relative w-24 h-24 xs:w-32 xs:h-32 mb-4 sm:mb-6 mx-auto">
                   <Image 
                     src="/logo.png" 
                     alt="FinFlow Logo" 
                     fill
                     className="object-cover rounded-3xl shadow-lg"
                     priority 
                   />
                </div>
                <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold tracking-tighter">
                  {t('welcome')}
                </h1>
                <p className="text-muted-foreground mt-2 text-sm xs:text-base sm:text-lg px-4">
                  {t('manageBudgets')}
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeInOut" }}
                 className="mt-6"
            >
                <Button
                    size="lg"
                    className="w-full h-12 xs:h-14 text-base sm:text-lg rounded-2xl bg-white text-gray-800 hover:bg-gray-100 shadow-md transition-transform active:scale-95"
                    onClick={() => googleLogin()}
                >
                    <FcGoogle className="mr-3 h-6 w-6 sm:h-7 sm:w-7" />
                    Sign in with Google
                </Button>
            </motion.div>
        </div>
    </div>
  );
}

export default function LoginPage() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 text-center bg-background">
         <h1 className="text-xl sm:text-2xl font-bold text-destructive mb-2">Configuration Error</h1>
         <p className="text-muted-foreground text-sm">
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
