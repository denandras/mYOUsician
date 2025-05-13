'use client';
import { useEffect, useState } from 'react';
import Header from '../components/Header';

export default function ConfirmPage() {
  const [message, setMessage] = useState('Confirming your email...');
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setMessage('Your email has already been confirmed or the confirmation link is invalid.');
      return;
    }

    // Simulate an API call to confirm the email
    const confirmEmail = async () => {
      try {
        // Replace this with your actual API call
        const response = await fetch(`/api/confirm-email?token=${token}`);
        if (response.ok) {
          setMessage('Your email has been successfully confirmed. You can now log in to your account.');
          setIsConfirmed(true);
        } else {
          setMessage('The confirmation link is invalid or has expired.');
        }
      } catch (error) {
        console.error('Error confirming email:', error);
        setMessage('An error occurred while confirming your email. Please try again later.');
      }
    };

    confirmEmail();
  }, []);

  return (
    <main className="confirm-page">
      <Header /> {/* Add the Header component */}
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