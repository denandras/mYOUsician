'use client';
import { useState, useEffect } from 'react';
import supabase from '../lib/supabase'; // Import the singleton Supabase client
import verifyUser from '../lib/getuser'; // Import the verifyUser function
import Header from '../components/Header'; // Adjust the path based on your folder structure

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null); // Define the user state

  // Check if the user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error);
        return;
      }

      // Use verifyUser to check if the user is logged in and handle redirection
      const isVerified = await verifyUser(session);
      if (isVerified) {
        setUser(session.user); // Set the user state
        // Redirect to profile page
        window.location.href = '/';
      }
    };

    checkUser();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('');

    // Step 0: Validate password length
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      // Step 1: Attempt to log in the user
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!loginError) {
        // Login successful, user already exists
        setMessage(
          <>
            This email is already registered. Please{' '}
            <a href="/login" className="login-link">log in</a> instead.
          </>
        );
        return;
      }

      // Step 2: Handle login errors
      if (loginError.message.includes('Invalid login credentials')) {
        setMessage(
          <>
            This email is already registered. Please{' '}
            <a href="/login" className="login-link">log in</a> instead.
          </>
        );
        return;
      }

      if (loginError.message.includes('User not found')) {
        // Step 3: If no user exists, proceed with signup
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/confirm`, // Redirect after email confirmation
          },
        });

        if (signupError) {
          if (signupError.message.includes('Invalid password')) {
            setMessage('The password you entered is invalid. Please try again.');
          } else {
            setMessage(`Error: ${signupError.message}`);
          }
          console.error('Signup error:', signupError);
          return;
        }

        // If signup is successful
        setMessage('Signup successful! Please check your email to confirm your account.');
        console.log('Signup success:', data);
        return;
      }

      // Handle unexpected login errors
      setMessage(`Unexpected error: ${loginError.message}`);
      console.error('Login error:', loginError);
    } catch (err) {
      // Handle unexpected errors
      setMessage('An unexpected error occurred. Please try again.');
      console.error('Unexpected error:', err);
    }
  };

  return (
    <main className="signup-page">
      <Header /> {/* Add the Header component */}
      <section className="signup-container">
        <h2 className="signup-title">Sign Up</h2>
        <p className="signup-description">
          Create an account to get started!
          </p>
        <form onSubmit={handleSignup} className="signup-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email:</label>
            <br/>
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
            <br/>
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
          <br/>
          <button type="submit" className="signup-button">
            Sign Up
          </button>
        </form>
        {message && <p className="signup-message">{message}</p>}
        <p className="login-redirect small-text">
          Already have an account?{' '}
          <a href="/login" className="login-link">Log in</a>.
        </p>
      </section>
    </main>
  );
}