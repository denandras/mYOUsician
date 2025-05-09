export default function Login() {
    return (
      <div>
        <input type="password" placeholder="Password" />
        <input type="email" placeholder="Email" />
        <button type="submit">login</button>
        <p>Don't have an account? <a href="/signup">Sign up</a></p>
        <p>Forgot your password? <a href="/reset-password">Reset Password</a></p>
      </div>
    );
  }
