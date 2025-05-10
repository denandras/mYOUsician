'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Ensure this is correctly initialized
import { useRouter } from 'next/router'; // Correct import for pages directory

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Check if a user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    checkUser();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
        return;
      }

      setUser(data.user);
      setMessage('Login successful!');
      console.log('Login success:', data);
    } catch (err) {
      setMessage('An unexpected error occurred.');
      console.error('Unexpected error:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMessage('Logged out successfully.');
  };

  return (
    <div className="signup-container">
      <h1>Login</h1>
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={handleLogout} className="signup-button">
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="signup-form">
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="signup-button">
            Login
          </button>
          <div>
            <a href="#" onClick={() => alert('Forgot password functionality not implemented yet.')} className="login-button">
              Forgot password?
            </a>
          </div>
          <div>
            <a href="/signup" className="login-button">
              Sign up
            </a>
          </div>
        </form>
      )}
      {message && <p className="message">{message}</p>}
    </div>
  );
}