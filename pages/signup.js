import { useState } from 'react';
import { signup } from '../lib/auth'; // Use the signup function from ../lib/auth

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      // Call the signup function and get the response
      const { user, message } = await signup(email, password);
      if (!user) {
        alert('Signup successful! Please check your email to confirm your account.');
        return;
      }

      // Inform the user about the signup status
      alert(message);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Sign up</button>
    </form>
  );
}