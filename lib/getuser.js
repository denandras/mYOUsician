'use client';
import supabase from '../lib/supabase';

/**
 * Function to verify if the session user matches the Supabase auth user.
 * @param {Object} session - The session object containing user information.
 * @returns {Promise<boolean>} - Returns true if the session user matches the Supabase auth user, otherwise false.
 */

async function verifyUser(session) {
    try {
        // Get the authenticated user from Supabase
        const { data: user, error } = await supabase.auth.getUser();

        if (error) {
            console.error('Error fetching user from Supabase:', error.message);
            return false;
        }

        // Check if session user ID matches Supabase user ID
        if (session && session.userId === user.id) {
            return true;
        }

        console.warn('Session user does not match Supabase auth user.');

        // Remove all keys from localStorage that match the pattern "sb-"
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('sb-')) {
                localStorage.removeItem(key);
            }
        });

        // Redirect to the index page
        // window.location.href = '/index';
        return false;
    } catch (err) {
        console.error('Error verifying user:', err.message);
        // Redirect to the index page
        window.location.href = '/index';
        return false;
    }
}

module.exports = verifyUser;