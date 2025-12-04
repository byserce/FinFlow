'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()

  // type-casting here for convenience
  // in a real app you should validate values
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return redirect('/login?message=Could not authenticate user')
  }

  // Create a profile for the new user
  const { data: { user } } = await supabase.auth.getUser();
  if(user) {
    await supabase.from('budget_profiles').insert([{ id: user.id, email: user.email, display_name: user.email }]);
  }


  return redirect('/login?message=Check email to continue sign in process')
}
