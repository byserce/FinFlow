'use client';
import { useState, useEffect, useCallback, useContext } from 'react';
import type { Profile } from '@/lib/types';

const USER_STORAGE_KEY = 'finflow_active_user';

export function useUser() {
    const [user, setUser] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(USER_STORAGE_KEY);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem(USER_STORAGE_KEY);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback((userProfile: Profile) => {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userProfile));
        setUser(userProfile);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
    }, []);

    const refetch = useCallback(() => {
        setIsLoading(true);
        try {
            const storedUser = localStorage.getItem(USER_STORAGE_KEY);
            if (storedUser) {
                const latestUser = JSON.parse(storedUser);
                // In a real app, you might want to fetch latest profile from server here
                setUser(latestUser);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to refetch user from localStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);


    return { 
      user,
      login,
      logout, 
      isLoading,
      refetch,
    };
}
