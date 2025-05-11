// filepath: c:\PC Sync\egyéb\code\_real projects\mYOUsician\mYOUsician\components\Header.js
import React from 'react';

export default function Header() {
  return (
    <header className="header">
      <nav className="header-nav">
        <a href="/" className="header-link">Home</a>
        <a href="/profile" className="header-link">Profile</a>
        <a href="/database" className="header-link">Database</a>
        <a href="/login" className="header-link">Log In</a>
        <a href="/signup" className="header-link">Sign Up</a>
      </nav>
    </header>
  );
}