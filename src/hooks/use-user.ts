'use client';
import { useState, useEffect, useCallback, useContext } from 'react';
import { AppContext } from '@/context/app-provider';
import type { Profile, SupabaseUser } from '@/lib/types';

export function useUser() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useUser must be used within an AppProvider');
    }

    const { supabase, allProfiles } = context;
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                
                if (currentUser) {
                    const userProfile = allProfiles.find(p => p.id === currentUser.id) || null;
                    setProfile(userProfile);
                } else {
                    setProfile(null);
                }
                
                setIsLoading(false);
            }
        );

        // Initial check
        const checkUser = async () => {
            const { data } = await supabase.auth.getUser();
            const currentUser = data.user;
            setUser(currentUser);
            if (currentUser) {
                 const userProfile = allProfiles.find(p => p.id === currentUser.id) || null;
                 setProfile(userProfile);
            }
            setIsLoading(false);
        }

        checkUser();

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, allProfiles]);

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    return { 
      user: profile, // Return the budget_profiles record as 'user' for app compatibility
      supabaseUser: user, // Return the actual auth user if needed
      logout, 
      isLoading: isLoading || context.isLoading
    };
}
