'use client';

export default function ConfirmPage() {
  return (
    <div className="signup-container">
      <h1>Email Confirmed</h1>
      <p>Your email has been successfully confirmed. You can now log in to your account.</p>
      <a href="/login" className="login-button">Go to Login</a>
    </div>
  );
}