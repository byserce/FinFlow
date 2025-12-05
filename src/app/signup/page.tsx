'use client';
import { useRouter } from 'next/navigation';
import LoginPage from '../login/page';

// Redirect to login page as signup is handled by Google login
export default function SignupPage() {
  const router = useRouter();
  if (typeof window !== 'undefined') {
    router.replace('/login');
  }
  return <LoginPage />;
}
