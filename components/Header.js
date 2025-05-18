import React, { useEffect, useState } from 'react';
import supabase from '../lib/supabase'; // Import the Supabase client
import verifyUser from '../lib/getuser'; // Import the verifyUser function
import signOut from '../lib/signOut'; // Import the reusable signOut function

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const [loading, setLoading] = useState(true); // State to track loading status

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!mounted) return;
      if (error) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }
      const user = await verifyUser(session);
      setIsLoggedIn(!!user);
      setLoading(false);
    };

    checkSession();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkSession();
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleLogout = async () => {
    const success = await signOut(); // Call the reusable signOut function
    if (success) {
      setIsLoggedIn(false); // Update state after logging out
      window.location.href = '/'; // Redirect to home page instead of login
    } else {
      console.error('Error logging out. Please try again.');
    }
  };

  return (
    <header className="header">
      <nav className="header-nav">
        {loading ? (
          <div className="header-loading">Loading...</div> // Styled loading text
        ) : isLoggedIn ? (
          <>
            <a href="/" className="header-link">Home</a>
            <a href="/database" className="header-link">Database</a>
            <a href="/profile" className="header-link">Profile</a>
            <button onClick={handleLogout} className="header-link logout-button">Log Out</button>
          </>
        ) : (
          <>
            <a href="/" className="header-link">Home</a>
            <a href="/login" className="header-link">Log In</a>
            <a href="/signup" className="header-link">Sign Up</a>
          </>
        )}
      </nav>
    </header>
  );
}