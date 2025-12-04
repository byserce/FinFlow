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
      email_confirm: false,
    },
  })

  // Case 1: A real error occurred (e.g., weak password)
  if (signUpError) {
      // If the error is that the user already exists, redirect to a special state
      if (signUpError.message.includes('User already registered')) {
          return redirect(`/signup?error=user_exists&email=${encodeURIComponent(email)}`);
      }
      // For any other signup error, show a generic message
      return redirect(`/signup?message=${signUpError.message}`)
  }

  // Case 2: Signup is successful, but user object is somehow null (edge case)
  if (!signUpData.user) {
    return redirect('/signup?message=Could not create user. Please try again.')
  }

  // Case 3: Successful signup, now create the profile
  const { error: profileError } = await supabase.from('budget_profiles').insert([
    {
      id: signUpData.user.id,
      email: signUpData.user.email,
      display_name: formData.get('display_name') as string || signUpData.user.email?.split('@')[0] || 'New User',
    },
  ]);

  if (profileError) {
      // This is a critical failure. The user exists in auth but not profiles.
      // We log it and redirect to the special state so they can create their profile manually.
      console.error('Error creating profile during signup:', profileError);
      return redirect(`/signup?error=user_exists&email=${encodeURIComponent(email)}&message=We could not create your profile automatically. Please complete it below.`);
  }

  // On successful signup AND profile creation, redirect to login with a success message.
  return redirect('/login?message=Signup successful! Please log in to continue.')
}


// New action to create a profile for an existing auth user
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
