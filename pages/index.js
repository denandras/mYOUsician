export default function Home() {
  return (
    <div className="signup-container">
      <h1>Welcome to mYOUsician</h1>
      <p>A database of musicians, for musicians!</p>
      <p>Find your next collaborator, or just browse!</p>
      <p>
        Check out the <a href="/database" className="login-button">musicians</a> page to get started!
      </p>
      <p>
        Already have an account? <a href="/login" className="login-button">Log in</a>
      </p>
      <p>
        Don't have an account? <a href="/signup" className="signup-button">Sign up</a>
      </p>
    </div>
  );
}