'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

function generateJoinCode() {
  return Math.random().toString(36).substring(2, 8);
}

export async function createBudget(formData: FormData) {
  const supabase = createClient();

  const name = formData.get('name') as string;
  const ownerId = formData.get('owner_id') as string;
  const mode = formData.get('mode') as 'tracking' | 'sharing';

  if (!ownerId) {
    return {
        error: 'Authentication error: User ID is missing.'
    }
  }
  
  const joinCode = generateJoinCode();

  // 1. Create the new budget plan
  const { data: budgetData, error: budgetError } = await supabase
    .from('budget_plans')
    .insert([{ name, owner_id: ownerId, join_code: joinCode, mode }])
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
    .insert([{ plan_id: budgetData.id, user_id: ownerId, role: 'owner', status: 'accepted' }]);

  if (memberError) {
    console.error('Error adding budget member:', memberError);
    // If adding the member fails, delete the created budget to avoid orphaned data
    await supabase.from('budget_plans').delete().eq('id', budgetData.id);
     return {
        error: 'Could not assign budget ownership. Please try again.'
    }
  }
}

export async function deleteBudget(budgetId: string) {
    const supabase = createClient();
    
    // First, delete related entries in budget_members
    const { error: membersError } = await supabase
        .from('budget_members')
        .delete()
        .eq('plan_id', budgetId);

    if (membersError) {
        console.error('Error deleting budget members:', membersError);
        return { error: 'Failed to prepare budget for deletion. Please try again.' };
    }

    // Second, delete related entries in budget_transactions
    const { error: transactionsError } = await supabase
        .from('budget_transactions')
        .delete()
        .eq('plan_id', budgetId);
        
    if (transactionsError) {
        console.error('Error deleting budget transactions:', transactionsError);
        return { error: 'Failed to clear transactions for deletion. Please try again.' };
    }
    
    // Finally, delete the budget plan itself
    const { error: planError } = await supabase
        .from('budget_plans')
        .delete()
        .eq('id', budgetId);

    if (planError) {
        console.error('Error deleting budget:', planError);
        return {
            error: 'Bütçe silinemedi. Lütfen tekrar deneyin.'
        }
    }
}


export async function addTransaction(formData: FormData) {
    const supabase = createClient();
    const budgetId = formData.get('budgetId') as string;
    const authorId = formData.get('author_id') as string;
    const payerId = formData.get('payer_id') as string | null;

    if (!authorId) {
        return {
            error: 'Authentication error: User ID is missing.'
        }
    }
    
    // Security Check: Verify user's role before adding transaction
    const { data: member, error: memberError } = await supabase
        .from('budget_members')
        .select('role')
        .eq('plan_id', budgetId)
        .eq('user_id', authorId)
        .eq('status', 'accepted')
        .single();
    
    if (memberError || !member) {
        return { error: 'You are not a member of this budget.' };
    }

    if (member.role === 'viewer') {
        return { error: 'You do not have permission to add transactions to this budget.' };
    }
    // End Security Check

    const transactionData = {
        plan_id: budgetId,
        author_id: authorId,
        payer_id: payerId === 'common' ? null : payerId,
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
}


export async function joinBudgetByCode(formData: FormData) {
    const supabase = createClient();
    const joinCode = formData.get('join_code') as string;
    const userId = formData.get('user_id') as string;

    if (!joinCode || !userId) {
        return { error: 'Join code and user ID are required.' };
    }

    // 1. Find the budget plan with the join code
    const { data: plan, error: planError } = await supabase
        .from('budget_plans')
        .select('id, owner_id')
        .eq('join_code', joinCode)
        .single();

    if (planError || !plan) {
        return { error: 'Invalid join code. Please check the code and try again.' };
    }
    
    if (plan.owner_id === userId) {
        return { error: 'You are the owner of this budget.' };
    }

    // 2. Check if a request or membership already exists
    const { data: existingMember, error: existingMemberError } = await supabase
        .from('budget_members')
        .select('*')
        .eq('plan_id', plan.id)
        .eq('user_id', userId)
        .maybeSingle();

    if(existingMember) {
        if(existingMember.status === 'accepted') {
            return { error: 'You are already a member of this budget.' };
        }
        if(existingMember.status === 'pending') {
            return { error: 'You have already sent a join request for this budget.' };
        }
    }

    // 3. Create a pending join request
    const { error: insertError } = await supabase
        .from('budget_members')
        .insert({
            plan_id: plan.id,
            user_id: userId,
            role: 'viewer', // Default role for new requests
            status: 'pending',
        });

    if (insertError) {
        console.error('Error creating join request:', insertError);
        return { error: 'Could not send join request. Please try again.' };
    }

    return { success: true };
}


export async function updateMemberStatus(planId: string, memberId: string, status: 'accepted' | 'rejected') {
    const supabase = createClient();

    if (status === 'rejected') {
        const { error } = await supabase
            .from('budget_members')
            .delete()
            .eq('plan_id', planId)
            .eq('user_id', memberId);

         if (error) return { error: 'Failed to reject request.' };
    } else {
         const { error } = await supabase
            .from('budget_members')
            .update({ status })
            .eq('plan_id', planId)
            .eq('user_id', memberId);
        
        if (error) return { error: 'Failed to accept request.' };
    }
    
    return { success: true };
}

export async function updateMemberRole(planId: string, memberId: string, role: 'editor' | 'viewer') {
    const supabase = createClient();
    
    const { error } = await supabase
        .from('budget_members')
        .update({ role })
        .eq('plan_id', planId)
        .eq('user_id', memberId);

    if (error) {
        console.error('Error updating role:', error);
        return { error: 'Failed to update member role.' };
    }

    return { success: true };
}


export async function removeMember(planId: string, memberId: string) {
    const supabase = createClient();
    
    const { error } = await supabase
        .from('budget_members')
        .delete()
        .eq('plan_id', planId)
        .eq('user_id', memberId);

    if (error) {
        console.error('Error removing member:', error);
        return { error: 'Failed to remove member.' };
    }

    return { success: true };
}
