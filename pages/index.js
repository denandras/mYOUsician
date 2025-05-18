import { useEffect, useState } from 'react';
import verifyUser from '../lib/getuser'; // Import the verifyUser function
import supabase from '../lib/supabase'; // Import the singleton Supabase client
import Header from '../components/Header';

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(null); // null indicates loading state

  useEffect(() => {
    const checkUser = async () => {
      const isVerified = await verifyUser();
      setIsSignedIn(!!isVerified);
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
        <Header /> {/* Add the Header component */}
        <section className="home-container">
          <h1 className="home-title">Welcome back to mYOUsician!</h1>
          <nav className="home-navigation">
            <button onClick={() => window.location.href = '/profile'} className="cta-button">
              Edit profile
            </button>
            <button onClick={() => window.location.href = '/database'} className="cta-button">
              Browse Database
            </button>
          </nav>
        </section>
      </main>
    );
  } else {
    // Render content for users who are not signed in
    return (
      <main className="home-page">
        <Header /> {/* Add the Header component */}
        <section className="home-container">
          <h1 className="home-title">Welcome to mYOUsician</h1>
          <div className="home-description">
            <p><em>A database of musicians, for musicians.</em></p>
          </div>
          <nav className="home-navigation">
            <button onClick={() => window.location.href = '/database'} className="cta-button">
              Browse the Database
            </button>
            <button onClick={() => window.location.href = '/signup'} className="cta-button">
              Create a Profile
            </button>
            <p className="small-text">
              Already have an account? <a href="/login" className="home-link">Log in</a>
            </p>
          </nav>
        </section>
      </main>
    );
  }
}