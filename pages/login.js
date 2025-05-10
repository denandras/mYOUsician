'use client';
import { useState, useEffect } from 'react';
import supabase from '../lib/supabase'; // Import the singleton Supabase client

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  // Check if a user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
        return;
      }
      if (session) {
        setUser(session.user);
        // Redirect to profile page
        window.location.href = '/profile';
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
      // Redirect to profile page after successful login
      window.location.href = '/profile';
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
    <main className="login-page">
      <section className="login-container">
        <h1 className="login-title">Login</h1>
        {user ? (
          <div className="user-info">
            <p className="welcome-message">Welcome, {user.email}</p>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="login-form">
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
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        )}
        {message && <p className="login-message">{message}</p>}
      </section>
    </main>
  );
}