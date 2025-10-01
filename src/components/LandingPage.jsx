// src/components/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureCarousel from './FeatureCarousel';
import PillAccordion from './PillAccordion';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleJoinMeeting = () => {
    navigate('/pre-meeting'); // Updated to go to pre-meeting setup
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Form submitted! We will get back to you soon.');
  };

  const handleGoogleSignIn = () => {
    console.log('Google Sign-in initiated');
    alert('Google Sign-in feature would be implemented here');
  };

  const featureItems = [
    {
      title: 'Do i need an account to join the meeting?',
      content: 'Yes, anyone can join meetings with just a click, but signup is required to participate or host the meeting.'
    },
    {
      title: 'Can i download call notes for offline use?',
      content: 'Yes! all meeting notes are downloadable and accessible even without internet connection.'
    },
    {
      title: 'How does call notes sharing works?',
      content: 'Host can share call notes on a separate screen live during the meeting for all the participants to see.'
    }
  ];

  return (
    <div className="landing-page">
      <nav className="landing-header">
        <div className="landing-nav-container">
          <span className="landing-brand">Rural Meet</span>
          <div className="landing-nav-links">
            <button className="landing-nav-btn">Home</button>
            <button className="landing-nav-btn">About us</button>
            <button className="landing-nav-btn" onClick={handleSignUp}>Login</button>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-header">
            <h1 className="hero-title">Elevate Your Meeting</h1>
            <p className="hero-subtitle">
              Experience seamless online collaboration with All-in-1, your modern
              meeting partner tailored for efficiency and style.
            </p>
          </div>

          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-features">
                <h3>Effortless Web Meetings</h3>
                <p className="feature-description">
                  Explore a comprehensive suite of premium meeting features designed to enhance your
                  streamlined collaboration, and objective real-time report. Unravel complex solutions
                  with collaborative engagement, fostering a dynamic environment for efficient communication
                  and successful outcomes.
                </p>
              </div>
              <button onClick={handleGoogleSignIn} className="sign-up-btn">
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
            <div className="hero-image">
              <div className="meeting-illustration">
                <img
                  src="/Screenshot%202025-09-29%20121212.jpg"
                  alt="Meeting illustration"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeatureCarousel />

      <section id="features" className="features-accordion-section">
        <PillAccordion items={featureItems} />
      </section>

      <section className="contact-section">
        <div className="contact-container">
          <h2 className="contact-title">Get in Touch</h2>
          <p className="contact-subtitle">
            For inquiries or support, reach out to our dedicated team.
            We're here to help!
          </p>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input type="text" placeholder="Name" className="contact-input" required />
              <input type="email" placeholder="Email Address" className="contact-input" required />
            </div>
            <div className="form-row">
              <input type="tel" placeholder="Phone" className="contact-input" required />
              <input type="text" placeholder="Subject" className="contact-input" required />
            </div>
            <textarea
              placeholder="Message"
              className="contact-textarea"
              rows="5"
              required
            ></textarea>
            <button type="submit" className="contact-submit-btn">Submit</button>
          </form>
        </div>
      </section>

      <footer className="landing-footer">
        <p>Copyright 2025</p>
      </footer>

      <button
        onClick={handleJoinMeeting}
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 2000,
          padding: '12px 20px',
          background: '#111',
          color: '#fff',
          borderRadius: 9999,
          border: 'none',
          boxShadow: '0 8px 20px rgba(0,0,0,.25)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '14px'
        }}
      >
        Join Meeting
      </button>
    </div>
  );
};

export default LandingPage;