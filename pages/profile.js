import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Profile() {
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // Redirect to login page if no session exists
                window.location.href = '/login';
                return;
            }

            const userId = session.user.id;

            const { data: musician, error } = await supabase
                .from('musicians')
                .select('*')
                .eq('id', userId)
                .single();

            if (error && error.code === 'PGRST116') {
                // No row found, insert a new one
                const { error: insertError } = await supabase
                    .from('musicians')
                    .insert([{ id: userId, name: session.user.email }]);

                if (insertError) {
                    console.error('Error inserting musician:', insertError);
                }
            } else if (error) {
                console.error('Error fetching musician:', error);
            }
        };

        checkUser();
    }, []);

    return (
        <div>
            <h1>Profile Editor</h1>
            <p>Profile functionality will be added soon.</p>
        </div>
    );
}