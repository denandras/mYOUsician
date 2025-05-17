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
          <h1 className="home-title">Welcome to mYOUsician.</h1>
          <div className='home-description'>
            <p>A database of musicians, for musicians. Find your next collaborator, or just browse!</p>
          </div>
          <nav className="home-navigation">
            <button onClick={() => window.location.href = '/signup'} className="cta-button">
              Sign up &#187;
            </button>
            <p className="small-text">
              &nbsp;Already have an account? <a href="/login" className="home-link">Log in</a>
            </p>
          </nav>
        </section>
      </main>
    );
  }
}