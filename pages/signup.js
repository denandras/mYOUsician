export default function Signup() {
    return (
      <div>
        <input type="text" placeholder="Forename" />
        <input type="text" placeholder="Surname" />
        <input type="password" placeholder="Password" />
        <input type="email" placeholder="Email" />
        <button type="submit">Sign Up</button>
        <p>Already have an account? <a href="/login">Log in</a></p>
        <p>By signing up, you agree to our <a href="/terms">terms and conditions</a>.</p>
      </div>
    );
  }