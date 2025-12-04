'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createBudget(formData: FormData) {
  const supabase = createClient();

  const name = formData.get('name') as string;
  const ownerId = formData.get('owner_id') as string;

  if (!ownerId) {
    return {
        error: 'Authentication error: User ID is missing.'
    }
  }

  // 1. Create the new budget plan
  const { data: budgetData, error: budgetError } = await supabase
    .from('budget_plans')
    .insert([{ name, owner_id: ownerId }])
    .select()
    .single();

  if (budgetError) {
    console.error('Error creating budget:', budgetError);
    return {
        error: 'Could not create the budget. Please try again.'
    }
  }

  // 2. Add the owner as a member in budget_members
  const { error: memberError } = await supabase
    .from('budget_members')
    .insert([{ plan_id: budgetData.id, user_id: ownerId, role: 'owner' }]);

  if (memberError) {
    console.error('Error adding budget member:', memberError);
    // If adding the member fails, delete the created budget to avoid orphaned data
    await supabase.from('budget_plans').delete().eq('id', budgetData.id);
     return {
        error: 'Could not assign budget ownership. Please try again.'
    }
  }
  
  revalidatePath('/');
  redirect(`/budget/${budgetData.id}`);
}

export async function deleteBudget(budgetId: string) {
    const supabase = createClient();
    
    // The database is set up with cascading deletes, so deleting a budget_plan
    // will also delete associated budget_members and budget_transactions.
    const { error } = await supabase
        .from('budget_plans')
        .delete()
        .eq('id', budgetId);

    if (error) {
        console.error('Error deleting budget:', error);
        return {
            error: 'Bütçe silinemedi. Lütfen tekrar deneyin.'
        }
    }

    revalidatePath('/');
}


export async function addTransaction(formData: FormData) {
    const supabase = createClient();
    const budgetId = formData.get('budgetId') as string;
    const authorId = formData.get('author_id') as string;

    if (!authorId) {
        return {
            error: 'Authentication error: User ID is missing.'
        }
    }

    const transactionData = {
        plan_id: budgetId,
        author_id: authorId,
        amount: parseFloat(formData.get('amount') as string),
        type: formData.get('type') as 'income' | 'expense',
        category: formData.get('category') as string,
        date: new Date(formData.get('date') as string).toISOString(),
        note: formData.get('note') as string,
    };

    const { error } = await supabase
        .from('budget_transactions')
        .insert([transactionData]);

    if (error) {
        console.error('Error adding transaction:', error);
        return {
            error: 'Could not add the transaction. Please try again.'
        }
    }

    revalidatePath(`/budget/${budgetId}`);
    revalidatePath(`/budget/${budgetId}/history`);
    revalidatePath(`/budget/${budgetId}/analytics`);
}
