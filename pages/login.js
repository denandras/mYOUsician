'use client';
import { useState, useEffect } from 'react';
import supabase from '../lib/supabase'; // Import the singleton Supabase client
import verifyUser from '../lib/getuser'; // Import the verifyUser function
import signOut from '../lib/signOut'; // Import the reusable signOut function
import Header from '../components/Header';
import { createuser } from '../lib/createuser'; // Add this import

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

      // Step 2: Check if user exists in users table
      const { data: userRows, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('uid', data.user.id)
        .maybeSingle();

      if (userError) {
        setMessage('Error checking user profile row.');
        return;
      }

      if (!userRows) {
        // User does not exist, create and redirect to profile
        const result = await createuser({ uid: data.user.id, email: data.user.email });
        if (result && result.error) {
          console.error('Error creating user row:', result.error);
          setMessage('Error creating user profile row.');
          return;
        }
        window.location.href = '/profile';
      } else {
        // User exists, redirect to index
        window.location.href = '/';
      }
    } catch (err) {
      setMessage('An unexpected error occurred. Please try again.');
      console.error('Unexpected error:', err);
    }
  };

  // Logout function using the reusable signOut function
  const handleLogout = async () => {
    const success = await signOut(); // Call the reusable signOut function
    if (success) {
      setUser(null); // Clear the user state
      setMessage('Logged out successfully.');
    } else {
      setMessage('Error logging out. Please try again.');
    }
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