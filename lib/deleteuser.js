import supabase from './supabase';

export async function deleteuser({ uid, email, password }) {
    try {
        console.log({ uid, email, password });
        const response = await fetch('https://qwmtnlqpwzkkrmnvusup.supabase.co/functions/v1/delete-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            // Show both error and details if available
            return { error: data.error || 'Failed to delete user.', details: data.details };
        }
        return { message: data.message || 'User deleted.' };
    } catch (err) {
        return { error: err.message || 'Unexpected error.' };
    }
}