import supabase from './supabase';

export async function deleteuser({ uid, email, password }) {
    // Optionally verify password here
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('uid', uid)
        .eq('email', email);

    if (error) {
        return { error: error.message || 'Failed to delete user.' };
    }
    return { message: 'User deleted.' };
}