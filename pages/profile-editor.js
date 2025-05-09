import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function ProfileEditor() {
  const [forename, setForename] = useState('');
  const [surname, setSurname] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const { data: user, error } = await supabase.auth.getUser();

      if (error || !user) {
        alert('User not found. Please log in again.');
        router.push('/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('musicians')
        .select('forename, surname')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log('No profile found. Please create one.');
      } else {
        setForename(profile.forename || '');
        setSurname(profile.surname || '');
      }
      setLoading(false);
    }

    fetchProfile();
  }, [router]);

  async function saveProfile() {
    setLoading(true);
    const { data: user, error } = await supabase.auth.getUser();

    if (error || !user) {
      alert('User not found. Please log in again.');
      router.push('/login');
      return;
    }

    const { error: saveError } = await supabase
      .from('musicians')
      .upsert({ id: user.id, forename, surname }, { onConflict: 'id' });

    if (saveError) {
      alert('Error saving profile: ' + saveError.message);
    } else {
      alert('Profile saved successfully!');
      router.push('/database'); // Redirect to another page after saving
    }
    setLoading(false);
  }

  return (
    <div>
      <h1>Edit Your Profile</h1>
      <label>
        Forename:
        <input
          type="text"
          value={forename}
          onChange={(e) => setForename(e.target.value)}
          disabled={loading}
        />
      </label>
      <br />
      <label>
        Surname:
        <input
          type="text"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          disabled={loading}
        />
      </label>
      <br />
      <button onClick={saveProfile} disabled={loading}>
        Save
      </button>
    </div>
  );
}