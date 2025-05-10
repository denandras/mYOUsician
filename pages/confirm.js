'use client';

export default function ConfirmPage() {
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h1>Email Confirmed</h1>
      <p>Your email has been successfully confirmed. You can now log in to your account.</p>
      <a href="/login">Go to Login</a>
    </div>
  );
}