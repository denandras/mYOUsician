import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function Confirm() {
  const [status, setStatus] = useState('Checking...');
  const router = useRouter();

  useEffect(() => {
    async function confirmSession() {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session?.user) {
        setStatus('No active session found. Please log in again.');
        return;
      }

      const user = sessionData.session.user;

      // Check if the user is already in the musicians table

      // Insert or update user in musicians table
      const { error: insertError } = await supabase
        .from('musicians')
        .upsert(
          {
            user_id: user.id,       // 👈 match your RLS condition
            email: user.email,      // optional: save user email too
            password: user.user_metadata?.password, // optional: save user password too
            forename: "András", // optional: replace with actual data
            surname: "Dénes",
          },
          { onConflict: 'user_id' } // 👈 assumes 'user_id' is the unique key
        );

      if (insertError) {
        setStatus(`Error adding user to musicians table: ${insertError.message}`);
        return;
      }

      setStatus('Email confirmed and user logged in!');
      setTimeout(() => router.push('/login'), 3000);
    }

    confirmSession();
  }, []);

  return (
    <div>
      <h1>Email Confirmation</h1>
      <p>{status}</p>
    </div>
  );
}
