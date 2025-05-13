import supabase from './supabase'; // Import the Supabase client

const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      return false; // Return false if sign-out fails
    }
    console.log('User signed out successfully.');
    return true; // Return true if sign-out succeeds
  } catch (err) {
    console.error('Unexpected error during sign-out:', err);
    return false; // Return false if an unexpected error occurs
  }
};

export default signOut;