
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Profile } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_EMAILS = [
  "atakan.serce1@gmail.com",
  "atakan.serce4@gmail.com",
  "ceylin.ads1@gmail.com",
  "cey1725@gmail.com"
];

function generateJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}


export async function handleGoogleLogin(email: string, name: string, picture: string) {
  if (!ALLOWED_EMAILS.includes(email)) {
    console.error("Yetkisiz giriş denemesi:", email);
    return { error: "Bu uygulamaya sadece davetli üyeler giriş yapabilir." };
  }

  const supabase = createClient();
  
  // 1. Check if a profile with this email already exists.
  const { data: existingProfile, error: fetchError } = await supabase
    .from('budget_profiles')
    .select('*')
    .eq('email', email)
    .single();

  // If a user is found, return it.
  if (existingProfile) {
    return { user: existingProfile };
  }

  // If no user is found (and it's the specific 'no rows' error), create one.
  if (fetchError && fetchError.code === 'PGRST116') {
    const newUserId = uuidv4();
    const { data: newProfile, error: insertError } = await supabase
      .from('budget_profiles')
      .insert({
        id: newUserId,
        email: email,
        display_name: name,
        photo_url: picture,
        default_currency: 'USD' // Default currency for new users
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating new user profile:', insertError);
      return { error: 'Could not create a new user profile.' };
    }
    
    if (!newProfile) {
        return { error: 'Failed to create and retrieve new user profile.' };
    }

    return { user: newProfile };
  }
  
  // Handle other unexpected database errors during fetch
  if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return { error: 'Could not process login due to a database error.' };
  }

  // This part should not be reached if logic is correct, but as a fallback.
  return { error: 'An unexpected error occurred during the login process.' };
}

export async function createBudget(formData: FormData) {
  const supabase = createClient();
  const userId = formData.get('userId') as string;

  if (!userId) return { error: 'Authentication error: User is not logged in.' };

  const name = formData.get('name') as string;
  const ownerId = userId;
  const mode = formData.get('mode') as 'tracking' | 'sharing';
  const currency = formData.get('currency') as string;
  
  const joinCode = generateJoinCode();

  const { data: budgetData, error: budgetError } = await supabase
    .from('budget_plans')
    .insert([{ name, owner_id: ownerId, join_code: joinCode, mode, currency }])
    .select()
    .single();

  if (budgetError) {
    console.error('Error creating budget:', budgetError);
    return { error: 'Could not create the budget. Please try again.' };
  }

  const { error: memberError } = await supabase
    .from('budget_members')
    .insert([{ plan_id: budgetData.id, user_id: ownerId, role: 'owner', status: 'accepted' }]);

  if (memberError) {
    console.error('Error adding budget member:', memberError);
    await supabase.from('budget_plans').delete().eq('id', budgetData.id);
    return { error: 'Could not assign budget ownership. Please try again.' };
  }
}

export async function deleteBudget(budgetId: string, userId: string) {
    const supabase = createClient();
    
    if (!userId) return { error: 'Authentication error: User is not logged in.' };
    
    // Security check: Only the owner can delete a budget
    const { data: plan, error: planFetchError } = await supabase
        .from('budget_plans')
        .select('owner_id')
        .eq('id', budgetId)
        .single();
    
    if (planFetchError || !plan) return { error: 'Budget not found or you do not have permission to delete it.' };
    if (plan.owner_id !== userId) return { error: 'Only the budget owner can delete the budget.' };

    const { error: membersError } = await supabase
        .from('budget_members')
        .delete()
        .eq('plan_id', budgetId);

    if (membersError) {
        console.error('Error deleting budget members:', membersError);
        return { error: 'Failed to prepare budget for deletion. Please try again.' };
    }

    const { error: transactionsError } = await supabase
        .from('budget_transactions')
        .delete()
        .eq('plan_id', budgetId);
        
    if (transactionsError) {
        console.error('Error deleting budget transactions:', transactionsError);
        return { error: 'Failed to clear transactions for deletion. Please try again.' };
    }
    
    const { error: planError } = await supabase
        .from('budget_plans')
        .delete()
        .eq('id', budgetId);

    if (planError) {
        console.error('Error deleting budget:', planError);
        return { error: 'Bütçe silinemedi. Lütfen tekrar deneyin.' };
    }
}


export async function addTransaction(formData: FormData) {
    const supabase = createClient();
    const authorId = formData.get('author_id') as string;
    if (!authorId) return { error: 'Authentication error: User is not logged in.' };

    const budgetId = formData.get('budgetId') as string;
    const payerId = formData.get('payer_id') as string | null;
    const participantIds = formData.getAll('participant_ids') as string[];

    const { data: member, error: memberError } = await supabase
        .from('budget_members')
        .select('role, budget_plans(mode)')
        .eq('plan_id', budgetId)
        .eq('user_id', authorId)
        .eq('status', 'accepted')
        .single();
    
    if (memberError || !member) return { error: 'You are not a member of this budget.' };
    if (member.role === 'viewer') return { error: 'You do not have permission to add transactions to this budget.' };

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

    const { data: newTransaction, error } = await supabase
        .from('budget_transactions')
        .insert([transactionData])
        .select()
        .single();

    if (error || !newTransaction) {
        console.error('Error adding transaction:', error);
        return { error: 'Could not add the transaction. Please try again.' };
    }
    
    const budgetMode = member.budget_plans?.mode;
    if (budgetMode === 'sharing' && participantIds.length > 0) {
        const participantData = participantIds.map(userId => ({
            transaction_id: newTransaction.id,
            user_id: userId,
        }));
        
        const { error: participantsError } = await supabase
            .from('transaction_participants')
            .insert(participantData);

        if (participantsError) {
            console.error('Error adding transaction participants:', participantsError);
            await supabase.from('budget_transactions').delete().eq('id', newTransaction.id);
            return { error: 'Could not assign participants to the transaction. Please try again.' };
        }
    }
}

export async function deleteTransaction(transactionId: string, budgetId: string, userId: string) {
    const supabase = createClient();
    if (!userId) return { error: 'You must be logged in to delete transactions.' };

    const { data: member, error: memberError } = await supabase
        .from('budget_members')
        .select('role')
        .eq('plan_id', budgetId)
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .single();
    
    if (memberError || !member) return { error: 'You are not a member of this budget.' };
    if (member.role === 'viewer') return { error: 'You do not have permission to delete transactions in this budget.' };

    const { error: participantsError } = await supabase
        .from('transaction_participants')
        .delete()
        .eq('transaction_id', transactionId);

    if (participantsError) {
        console.error('Error deleting transaction participants:', participantsError);
        return { error: 'Failed to clear transaction participants before deletion.' };
    }

    const { error: transactionError } = await supabase
        .from('budget_transactions')
        .delete()
        .eq('id', transactionId);

    if (transactionError) {
        console.error('Error deleting transaction:', transactionError);
        return { error: 'Failed to delete the transaction.' };
    }
    
    revalidatePath(`/budget/${budgetId}/history`);
    
    return { success: true };
}


export async function joinBudgetByCode(formData: FormData) {
    const supabase = createClient();
    
    const userId = formData.get('userId') as string;
    if (!userId) return { error: 'Authentication error: User is not logged in.' };

    const joinCode = formData.get('join_code') as string;

    if (!joinCode) return { error: 'Join code is required.' };

    const { data: plan, error: planError } = await supabase
        .from('budget_plans')
        .select('id, owner_id')
        .eq('join_code', joinCode)
        .single();

    if (planError || !plan) return { error: 'Invalid join code. Please check the code and try again.' };
    if (plan.owner_id === userId) return { error: 'You are the owner of this budget.' };

    const { data: existingMember } = await supabase
        .from('budget_members')
        .select('*')
        .eq('plan_id', plan.id)
        .eq('user_id', userId)
        .maybeSingle();

    if(existingMember) {
        if(existingMember.status === 'accepted') return { error: 'You are already a member of this budget.' };
        if(existingMember.status === 'pending') return { error: 'You have already sent a join request for this budget.' };
    }

    const { error: insertError } = await supabase
        .from('budget_members')
        .insert({
            plan_id: plan.id,
            user_id: userId,
            role: 'viewer',
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


export async function updateUserProfile(formData: FormData) {
    const supabase = createClient();
    const userId = formData.get('userId') as string;
    if (!userId) return { error: 'User not authenticated.' };

    const displayName = formData.get('displayName') as string;
    const photoURL = formData.get('photoURL') as string;
    const defaultCurrency = formData.get('default_currency') as string;

    const { data, error } = await supabase
        .from('budget_profiles')
        .update({
            display_name: displayName,
            photo_url: photoURL,
            default_currency: defaultCurrency
        })
        .eq('id', userId)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating profile:', error);
        return { error: 'Failed to update profile.' };
    }
    
    return { success: true, updatedProfile: data };
}

export async function updateBudgetCurrency(budgetId: string, currency: string, userId: string) {
    const supabase = createClient();
    if (!userId) return { error: 'User not authenticated.' };
    
    // Security Check
    const { data: member } = await supabase
        .from('budget_members')
        .select('role')
        .eq('plan_id', budgetId)
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .single();

    if (member?.role !== 'owner') {
        return { error: 'Only the budget owner can change the currency.' };
    }

    const { error } = await supabase
        .from('budget_plans')
        .update({ currency })
        .eq('id', budgetId);

    if (error) {
        console.error('Error updating budget currency:', error);
        return { error: 'Failed to update budget currency.' };
    }
    
    return { success: true };
}

    

    



    