'use client';

export default function ConfirmPage() {
  return (
    <main className="confirm-page">
      <section className="confirm-container">
        <h1 className="confirm-title">Email Confirmed</h1>
        <p className="confirm-message">
          Your email has been successfully confirmed. You can now log in to your account.
        </p>
        <a href="/login" className="confirm-link">Go to Login</a>
      </section>
    </main>
  );
}