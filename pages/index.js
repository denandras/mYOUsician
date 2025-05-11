import { useEffect, useState } from 'react';
import verifyUser from '../lib/getuser'; // Import the verifyUser function
import supabase from '../lib/supabase'; // Import the singleton Supabase client

export default function Home() {
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
      <main className="home-page">
        <section className="home-container">
          <h1 className="home-title">Welcome to mYOUsician</h1>
          <p className="home-description">Welcome back! Explore your profile or the database.</p>
          <nav className="home-navigation">
            <p>
              Go to your <a href="/profile" className="home-link">Profile</a>
            </p>
            <p>
              Check out the <a href="/database" className="home-link">Database</a>
            </p>
          </nav>
        </section>
      </main>
    );
  } else {
    // Render content for users who are not signed in
    return (
      <main className="home-page">
        <section className="home-container">
          <h1 className="home-title">Welcome to mYOUsician</h1>
          <p className="home-description">A database of musicians, for musicians!</p>
          <p className="home-description">Find your next collaborator, or just browse!</p>
          <nav className="home-navigation">
            <p>
              Already have an account? <a href="/login" className="home-link">Log in</a>
            </p>
            <p>
              Don't have an account? <a href="/signup" className="home-link">Sign up</a>
            </p>
          </nav>
        </section>
      </main>
    );
  }
}