import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function Confirm() {
  const [status, setStatus] = useState('Checking...');
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: sessionData, error } = await supabase.auth.getSession();

      if (error || !sessionData.session) {
        setStatus('No active session. Please sign up or log in again.');
        return;
      }

      // Fetch the user data properly
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setStatus('Error fetching user data. Please log in again.');
        return;
      }

      const user = userData.user; // Correctly fetched user
      console.log('User confirmed:', user);

      setStatus('Email confirmed! You can now log in.');
      // Optionally redirect to dashboard, etc.
      // setTimeout(() => router.push('/dashboard'), 3000);
    };

    getSession();
  }, []);

  return (
    <div>
      <h1>Email Confirmation</h1>
      <p>{status}</p>
    </div>
  );
}
