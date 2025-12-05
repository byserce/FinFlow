'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Profile } from '@/lib/types';

const USER_STORAGE_KEY = 'active_user';

export function useUser() {
    const [user, setUser] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = useCallback(() => {
        try {
            const userJson = localStorage.getItem(USER_STORAGE_KEY);
            if (userJson) {
                setUser(JSON.parse(userJson));
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
        
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === USER_STORAGE_KEY) {
                loadUser();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        // Also listen for a custom event
        const handleProfileUpdate = () => loadUser();
        window.addEventListener('profile-updated', handleProfileUpdate);


        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('profile-updated', handleProfileUpdate);
        };
    }, [loadUser]);

    const logout = useCallback(() => {
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
        // We can't use router here, so logout is only responsible for clearing the state.
        // The component calling logout should handle the redirection.
    }, []);

    return { user, logout, isLoading, loadUser };
}
