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
      // This is helpful for local development to avoid SMTP errors.
      // In production, you would want to enable email confirmation.
      email_confirm: false,
    },
  })

  if (signUpError) {
    console.error('Sign up error:', signUpError)
    // Redirect with a more specific error message if possible
    return redirect(`/signup?message=${signUpError.message}`)
  }

  if (!signUpData.user) {
    return redirect('/signup?message=Could not create user. Please try again.')
  }

  // Create a profile for the new user in our public table
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
      // Redirect to login with a message that indicates a potential issue.
      return redirect(`/login?message=Signup successful, but profile creation failed. Please log in.`);
  }

  // On successful signup and profile creation, redirect to the login page with a success message.
  return redirect('/login?message=Signup successful! Please log in to continue.')
}
