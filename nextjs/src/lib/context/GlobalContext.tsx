// src/lib/context/GlobalContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';


type User = {
    email: string;
    id: string;
    registered_at: Date;
};

interface GlobalContextType {
    loading: boolean;
    user: User | null;  // Add this
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        async function initializeAuth() {
            try {
                const supabase = await createSPASassClient();
                const client = supabase.getSupabaseClient();

                // Get initial user data
                const { data: { user } } = await client.auth.getUser();
                if (user) {
                    setUser({
                        email: user.email!,
                        id: user.id,
                        registered_at: new Date(user.created_at)
                    });
                } else {
                    setUser(null);
                }

                // Listen for auth state changes
                const { data: { subscription } } = client.auth.onAuthStateChange(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    async (event: any, session: any) => {
                        if (event === 'SIGNED_OUT' || !session?.user) {
                            setUser(null);
                        } else if (session?.user) {
                            setUser({
                                email: session.user.email!,
                                id: session.user.id,
                                registered_at: new Date(session.user.created_at)
                            });
                        }
                    }
                );

                return () => {
                    subscription.unsubscribe();
                };

            } catch (error) {
                console.error('Error initializing auth:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        if (mounted) {
            const cleanup = initializeAuth();
            return () => {
                cleanup.then(fn => fn?.());
            };
        }
    }, [mounted]);

    return (
        <GlobalContext.Provider value={{ loading, user }}>
            {children}
        </GlobalContext.Provider>
    );
}

export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
};