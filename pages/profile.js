import { useEffect } from 'react';
import supabase from '../lib/supabase'; // Import the singleton Supabase client

export default function Profile() {
    useEffect(() => {
        const checkUser = async () => {
            try {
                // Use the updated method to get the session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Error fetching session:', sessionError);
                    return;
                }

                if (!session) {
                    // Redirect to login page if no session exists
                    window.location.href = '/login';
                    return;
                }

                const userId = session.user.id;

                // Fetch user data
                const { data: user, error: fetchError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('uid', userId) // Use 'uid' instead of 'id'
                    .single();

                if (fetchError) {
                    if (fetchError.code === 'PGRST116') {
                        // No row found, insert a new one
                        const { error: insertError } = await supabase
                            .from('users')
                            .insert([{ uid: userId, email: session.user.email }]);

                        if (insertError) {
                            console.error('Error inserting user:', insertError);
                        } else {
                            console.log('New user record created successfully.');
                        }
                    } else {
                        console.error('Error fetching user:', fetchError);
                    }
                } else {
                    console.log('User data fetched successfully:', user);
                }
            } catch (err) {
                console.error('Unexpected error in checkUser:', err);
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