'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase'; // Ensure this is correctly initialized

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
        return;
      }

      setMessage('Signup successful! Please check your email to confirm your account.');
      console.log('Signup success:', data);
    } catch (err) {
      setMessage('An unexpected error occurred.');
      console.error('Unexpected error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1>Sign Up</h1>
      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Sign Up
        </button>
      </form>
      {message && <p style={{ marginTop: '20px', color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}