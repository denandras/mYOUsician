export default function Signup() {
    return (
      <div>
        <input type="password" placeholder="Password" />
        <input type="email" placeholder="Email" />
        <button type="submit">login</button>
        <p>Don't have an account? <a href="/signup">Sign up</a></p>
      </div>
    );
  }