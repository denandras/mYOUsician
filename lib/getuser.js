'use client';
import supabase from '../lib/supabase';

/**
 * Function to verify if the current Supabase auth user is valid.
 * @returns {Promise<Object|false>} - Returns user object if valid, otherwise false.
 * If the token is invalid/expired, returns false and logs a message.
 */
async function verifyUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        if (error.message && error.message.toLowerCase().includes('jwt expired')) {
            console.warn('Session expired. Please log in again.');
        } else {
            console.warn('Auth error:', error.message || error);
        }
        return false;
    }
    if (!data?.user) return false;
    return data.user;
}

export default verifyUser;