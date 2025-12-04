'use server'

import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const origin = headers().get('origin')
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createClient()

  // Step 1: Attempt to sign up the user in Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // This is false, so no confirmation email is sent.
      email_confirm: false, 
      // We pass metadata which can be used by the layout to create the profile
      data: {
        display_name: formData.get('display_name') as string,
      }
    },
  })

  // Case 1: A real error occurred (e.g., weak password, or user already exists)
  if (signUpError) {
      // If the error is that the user already exists, redirect to a special state
      // so the user can just log in.
      if (signUpError.message.includes('User already registered')) {
          return redirect(`/login?message=Bu kullanıcı zaten kayıtlı. Lütfen giriş yapın.`);
      }
      // For any other signup error, show a generic message
      return redirect(`/signup?message=${signUpError.message}`)
  }

  // Case 2: Signup is successful, but user object is somehow null (edge case)
  if (!signUpData.user) {
    return redirect('/signup?message=Could not create user. Please try again.')
  }

  // On successful signup, redirect to login with a success message.
  // The RootLayout will handle profile creation on the first successful login.
  return redirect('/login?message=Kayıt başarılı! Devam etmek için lütfen giriş yapın.')
}


// This action is kept in case the user needs to manually complete their profile,
// although the new RootLayout logic should make this scenario rare.
export async function createProfile(formData: FormData) {
    const supabase = createClient();

    // First, ensure the user is logged in to get their ID
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // This should not happen if they just logged in, but as a safeguard...
        return redirect('/login?message=You must be logged in to create a profile.');
    }

    const displayName = formData.get('display_name') as string;

    // Check if a profile ALREADY exists, just in case.
    const { data: existingProfile } = await supabase
        .from('budget_profiles')
        .select('id')
        .eq('id', user.id)
        .single();
    
    if (existingProfile) {
        return redirect('/?message=Profile already exists.');
    }
    
    // Create the profile
    const { error: profileError } = await supabase.from('budget_profiles').insert([
        {
            id: user.id,
            email: user.email,
            display_name: displayName,
        }
    ]);

    if (profileError) {
        return redirect(`/signup?error=user_exists&email=${encodeURIComponent(user.email || '')}&message=${profileError.message}`);
    }

    // Success! Redirect to the main page.
    return redirect('/');
}
