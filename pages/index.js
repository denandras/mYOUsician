export default function Home() {
  return (
    <main className="home-page">
      <section className="home-container">
        <h1 className="home-title">Welcome to mYOUsician</h1>
        <p className="home-description">A database of musicians, for musicians!</p>
        <p className="home-description">Find your next collaborator, or just browse!</p>
        <nav className="home-navigation">
          <p>
            Check out the <a href="/database" className="home-link">database</a> page to get started!
          </p>
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