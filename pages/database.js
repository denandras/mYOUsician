import React, { useEffect, useState } from 'react';
import verifyUser from '../lib/getuser'; // Import the verifyUser function
import supabase from '../lib/supabase'; // Import the singleton Supabase client
import Header from '../components/Header'; // Adjust the path based on your folder structure

export default function Database() {
  const [isSignedIn, setIsSignedIn] = useState(null); // null indicates loading state

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error);
        setIsSignedIn(false); // Treat as not signed in if there's an error
        return;
      }

      // Use verifyUser to check if the user is signed in
      const isVerified = await verifyUser(session);
      setIsSignedIn(isVerified);
    };

    checkUser();
  }, []);

  if (isSignedIn === null) {
    // Render nothing while checking authentication
    return null;
  }

  if (isSignedIn) {
    // Render content for signed-in users
    return (
      <main className="database-page">
        <Header /> {/* Add the Header component */}
        <section className="database-container">
          <h1 className="database-title">Welcome to the Database</h1>
          <p className="database-description">Here you can explore all the data available to you.</p>
          <nav className="database-navigation">
            <p>
              Go to your <a href="/profile" className="database-link">Profile</a>
            </p>
            <p>
              Return to the <a href="/" className="database-link">Home Page</a>
            </p>
          </nav>
        </section>
      </main>
    );
  } else {
    // Render content for users who are not signed in
    return (
      <main className="database-page">
        <section className="database-container">
          <h1 className="database-title">Access Restricted</h1>
          <p className="database-description">You need to be signed in to access the database.</p>
          <nav className="database-navigation">
            <p>
              Already have an account? <a href="/login" className="database-link">Log in</a>
            </p>
            <p>
              Don't have an account? <a href="/signup" className="database-link">Sign up</a>
            </p>
          </nav>
        </section>
      </main>
    );
  }
}