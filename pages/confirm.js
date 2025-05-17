'use client';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import supabase from '../lib/supabase';

export default function ConfirmPage() {
  const [message, setMessage] = useState('Confirming your email...');
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const checkConfirmation = async () => {
      // Check for token in URL (redirected from email)
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (token) {
        setMessage('Your email has been successfully confirmed. You can now log in to your account.');
        setIsConfirmed(true);

        // Remove session after showing message
        setTimeout(async () => {
          await supabase.auth.signOut();
        }, 1000); // 1 second delay so user sees the message
      } else {
        setMessage('Invalid or expired confirmation link. Please check your email or try again.');
        setIsConfirmed(false);
      }
    };

    checkConfirmation();
  }, []);

  return (
    <main className="confirm-page">
      <Header />
      <section className="confirm-container">
        <h1 className="confirm-title">{isConfirmed ? 'Email Confirmed' : 'Confirmation Error'}</h1>
        <p className="confirm-message">{message}</p>
        {isConfirmed ? (
          <a href="/login" className="confirm-link">Go to Login</a>
        ) : (
          <a href="/" className="confirm-link">Go to Home</a>
        )}
      </section>
    </main>
  );
}