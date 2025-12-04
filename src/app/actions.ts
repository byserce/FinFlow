'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addTransaction(plan_id: string, formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const rawFormData = {
    plan_id: plan_id,
    author_id: user.id,
    amount: parseFloat(formData.get('amount') as string),
    type: formData.get('type') as 'income' | 'expense',
    category: formData.get('category') as string,
    date: new Date(formData.get('date') as string).toISOString(),
    note: formData.get('note') as string,
  };

  const { error } = await supabase.from('budget_transactions').insert([rawFormData]);

  if (error) {
    console.error('Error inserting transaction:', error);
    // Redirect back with an error message
    return redirect(`/budget/${plan_id}?error=${error.message}`);
  }

  revalidatePath(`/budget/${plan_id}`);
  revalidatePath('/'); // Also revalidate the main page to update total balance if shown there
}

export async function createBudget(formData: FormData) {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/login');
    }

    const name = formData.get('name') as string;

    const { data, error } = await supabase.from('budget_plans').insert([{ name: name, owner_id: user.id }]).select().single();

    if (error) {
        console.error('Error creating budget:', error);
        return redirect(`/?error=${error.message}`);
    }

    revalidatePath('/');
    if (data) {
      redirect(`/budget/${data.id}`);
    }
}
