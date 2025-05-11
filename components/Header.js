import React, { useEffect, useState } from 'react';
import supabase from '../lib/supabase'; // Import the Supabase client
import verifyUser from '../lib/getuser'; // Import the verifyUser function

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const [loading, setLoading] = useState(true); // State to track loading status

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error);
        setIsLoggedIn(false);
        setLoading(false); // Stop loading if there's an error
        return;
      }

      const isVerified = await verifyUser(session);
      setIsLoggedIn(isVerified); // Set login status based on session verification
      setLoading(false); // Stop loading after session check
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false); // Update state after logging out
    window.location.href = '/login'; // Redirect to login page
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