import { supabase } from './supabase';

export async function signup(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/confirm?email=${email}`, // Include email in the redirect URL
    },
  });

  if (error) throw new Error(error.message);

  return {
    user: data.user,
    message: 'Signup successful! Please check your email to confirm your account.',
  };
}

export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw new Error(error.message);

    return data;
}

export async function logout() {
    await supabase.auth.signOut();
}
