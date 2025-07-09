// src/lib/context/GlobalContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';


type User = {
    email: string;
    id: string;
    registered_at: Date;
    forename?: string | null;
    surname?: string | null;
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
                    // Fetch profile data to get forename and surname
                    const { data: profile } = await client
                        .from('musician_profiles')
                        .select('forename, surname')
                        .eq('id', user.id)
                        .single();

                    setUser({
                        email: user.email!,
                        id: user.id,
                        registered_at: new Date(user.created_at),
                        forename: profile?.forename || null,
                        surname: profile?.surname || null
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
                            // Fetch profile data for the logged-in user
                            const { data: profile } = await client
                                .from('musician_profiles')
                                .select('forename, surname')
                                .eq('id', session.user.id)
                                .single();

                            setUser({
                                email: session.user.email!,
                                id: session.user.id,
                                registered_at: new Date(session.user.created_at),
                                forename: profile?.forename || null,
                                surname: profile?.surname || null
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