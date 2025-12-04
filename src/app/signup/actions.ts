'use server'

import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const origin = headers().get('origin')
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createClient()

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Disable email confirmation for development to avoid SMTP errors.
      // In production, you would remove this or set it to true
      // after configuring your SMTP provider in Supabase.
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (signUpError) {
    console.error('Sign up error:', signUpError)
    return redirect(`/signup?message=${signUpError.message}`)
  }

  if (!signUpData.user) {
    return redirect('/signup?message=Could not create user. Please try again.')
  }

  // Create a profile for the new user
  const { error: profileError } = await supabase.from('budget_profiles').insert([
    {
      id: signUpData.user.id,
      email: signUpData.user.email,
      display_name: signUpData.user.email?.split('@')[0] ?? 'New User',
    },
  ]);

  if (profileError) {
      console.error('Error creating profile:', profileError);
      // Even if profile creation fails, the user is signed up in Auth.
      // Let them log in and maybe handle profile creation on first login.
      // For now, redirect with a generic success message.
      return redirect('/login?message=Check email to continue sign in process. Profile creation may have failed.');
  }

  return redirect('/login?message=Check email to continue sign in process')
}
