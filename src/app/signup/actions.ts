'use server'

import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const origin = headers().get('origin')
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createClient()

  // Step 1: Sign up the user in Supabase Auth
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

  // signUpData.user should not be null if there is no error, but we check just in case.
  if (!signUpData.user) {
    return redirect('/signup?message=Could not create user. Please try again.')
  }

  // Step 2: Create a profile for the new user in our public table
  // This runs immediately after the user is created in auth.
  const { error: profileError } = await supabase.from('budget_profiles').insert([
    {
      id: signUpData.user.id,
      email: signUpData.user.email,
      display_name: signUpData.user.email?.split('@')[0] ?? 'New User',
    },
  ]);

  if (profileError) {
      console.error('Error creating profile:', profileError);
      // IMPORTANT: If profile creation fails, we should inform the user.
      // For now, we redirect to login, but in a real app, you might want to handle this more gracefully,
      // maybe by attempting to delete the auth user or showing a specific error page.
      return redirect(`/signup?message=Could not create your user profile. Error: ${profileError.message}`);
  }

  // On successful signup AND profile creation, redirect to the login page with a success message.
  return redirect('/login?message=Signup successful! Please log in to continue.')
}
