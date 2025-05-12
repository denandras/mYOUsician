'use client';
import { useState, useEffect } from 'react';
import supabase from '../lib/supabase'; // Import the singleton Supabase client
import verifyUser from '../lib/getuser'; // Import the verifyUser function
import Header from '../components/Header'; // Adjust the path based on your folder structure

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  // Check if a user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error);
        setLoading(false); // Stop loading if there's an error
        return;
      }

      // Use verifyUser to check if the user is logged in and handle redirection
      const isVerified = await verifyUser(session);
      if (isVerified) {
        setUser(session.user);
        // Redirect to profile page
        window.location.href = '/profile';
        return;
      }

      setLoading(false); // Stop loading after the check
    };

    checkUser();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      // Step 1: Attempt to log in the user
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

      // Step 2: Check if the user exists in the `users` table
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('uid')
        .eq('uid', data.user.id)
        .single();

      if (userCheckError && userCheckError.code === 'PGRST116') {
        // User does not exist in the `users` table (first login)
        console.log('First login detected. Redirecting to profile page...');
        window.location.href = '/profile';
        return;
      }

      if (userCheckError) {
        // Handle unexpected errors
        console.error('Error checking user in users table:', userCheckError);
        setMessage('An error occurred while checking your account. Please try again.');
        return;
      }

      // User exists in the `users` table, redirect to index page
      console.log('User exists. Redirecting to index page...');
      window.location.href = '/';
    } catch (err) {
      // Handle unexpected errors
      setMessage('An unexpected error occurred. Please try again.');
      console.error('Unexpected error:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMessage('Logged out successfully.');
  };

  // Render nothing while loading
  if (loading) {
    return null;
  }

  return (
    <main className="login-page">
      <Header /> {/* Add the Header component */}
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
                placeholder=""
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
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">
              Login
            </button>
            <p className="signup-link small-text">
              Don't have an account? <a href="/signup">Sign up here</a>
            </p>
          </form>
        )}
        {message && <p className="login-message">{message}</p>}
      </section>
    </main>
  );
}