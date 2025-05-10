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
        options: {
          emailRedirectTo: `${window.location.origin}/confirm`, // Redirect after email confirmation
        },
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
    <main className="signup-page">
      <section className="signup-container">
        <h1 className="signup-title">Sign Up</h1>
        <form onSubmit={handleSignup} className="signup-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email:</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password:</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="signup-button">Sign Up</button>
        </form>
        {message && <p className="signup-message">{message}</p>}
        <div className="signup-footer">
          <a href="/login" className="login-link">Already have an account? Log in</a>
        </div>
      </section>
    </main>
  );
}