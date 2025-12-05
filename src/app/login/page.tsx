'use client';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { handleGoogleLogin } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { useUser } from '@/hooks/use-user';
import { useEffect } from 'react';

interface GoogleJwtPayload {
  email: string;
  name: string;
  picture: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { login, user } = useUser();

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);
  
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast({ variant: 'destructive', title: t('error'), description: 'Google login failed.' });
      return;
    }
    try {
      const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential);
      const userProfile = await handleGoogleLogin(decoded.email, decoded.name, decoded.picture);
      
      login(userProfile);

      toast({ title: t('success'), description: t('loginSuccess') });
      router.push('/');
    } catch (error) {
      console.error('Login processing error:', error);
      toast({ variant: 'destructive', title: t('error'), description: (error as Error).message });
    }
  };

  const handleError = () => {
    toast({ variant: 'destructive', title: t('error'), description: 'Google login failed. Please try again.' });
  };
  
  if (!googleClientId) {
    return (
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-4 items-center text-center">
         <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
         <p className="text-muted-foreground">
            The Google Client ID is missing. Please set the <code className="bg-muted px-1 py-0.5 rounded-sm">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> environment variable.
        </p>
      </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-4 items-center">
        <div className="text-center mb-4">
            <h1 className="text-3xl font-bold">{t('welcome')}</h1>
            <p className="text-muted-foreground">{t('manageBudgets')}</p>
        </div>

        <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap={false}
            theme="filled_blue"
            shape="rectangular"
            width="320px"
        />
        </div>
    </GoogleOAuthProvider>
  );
}
