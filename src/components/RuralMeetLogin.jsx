// RuralMeetLogin.jsx
import React, { useState } from 'react';
import { Users, ArrowLeft } from 'lucide-react';
import './RuralMeetLogin.css';

const RuralMeetLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBack = () => {
    console.log('Back button clicked');
    window.history.back();
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    alert('Login successful! Check console for details.');
  };

  const handleGoogleSignIn = () => {
    console.log('Google Sign-in initiated');
    alert('Google Sign-in feature would be implemented here');
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <nav className="nav-header">
        <div className="nav-container">
          {/* Brand Section */}
          <div className="brand-section">
            <button className="back-btn" onClick={handleBack}>
              <ArrowLeft size={20} />
            </button>
            <span className="brand-name">Rural Meet</span>
            <div className="vertical-separator"></div>
          </div>
          
          {/* Navigation Links */}
          <div className="nav-links">
            <button className="nav-btn">Home</button>
            <button className="nav-btn">About us</button>
            <button className="nav-btn">Login</button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="main-wrapper">
        <div className="login-container">
          {/* Heading and Subheading */}
          <div className="header-section">
            <h1 className="main-heading">Join The Conversation</h1>
            <p className="sub-heading">Connect with your students, teams and client easily</p>
          </div>

          {/* Icon */}
          <div className="icon-section">
            <div className="icon-wrapper">
              <Users size={40} className="users-icon" />
            </div>
          </div>

          {/* Login Form */}
          <div className="form-section">
            {/* Email Input */}
            <div className="input-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@gmail.com"
                className="input-field"
              />
            </div>

            {/* Password Input */}
            <div className="input-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="input-field"
              />
            </div>

            {/* Submit Button */}
            <button onClick={handleSubmit} className="submit-btn">
              Submit
            </button>
          </div>

          {/* Separator */}
          <div className="separator">
            <div className="separator-line"></div>
            <span className="separator-text">OR</span>
            <div className="separator-line"></div>
          </div>

          {/* Google Sign-in Button */}
          <button onClick={handleGoogleSignIn} className="google-btn">
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RuralMeetLogin;