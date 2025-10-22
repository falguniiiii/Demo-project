import React, { useState } from 'react';
import './Host.css';
import {
  FiArrowLeft,
  FiSettings,
  FiHelpCircle,
  FiUser,
  FiChevronRight,
  FiMessageSquare,
  FiUpload,
  FiCalendar,
  FiArrowRight,
} from 'react-icons/fi';

// Meeting preview image - using a screenshot-like meeting interface
const posterImg =
  "https://framerusercontent.com/images/w5JvkUHefjGZcnDK7kHpmrMOk.png?width=1024&height=1024";

export default function Host() {
  const [toggleOn, setToggleOn] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [enableWaitingRoom, setEnableWaitingRoom] = useState(true);
  const [allowScreenShare, setAllowScreenShare] = useState(false);
  const [recordMeeting, setRecordMeeting] = useState(true);
  const [autoCaptions, setAutoCaptions] = useState(false);

  const handleLogout = () => {
    console.log('Logging out...');
    setShowProfile(false);
    // Add navigation to login page here
  };

  const handleStartMeeting = () => {
    alert('Joining Meeting!');
  };

  const handleToggleRecording = () => {
    setRecordMeeting(prev => !prev);
    if (!recordMeeting) {
      alert('Recording Started 🎥');
    } else {
      alert('Recording Stopped ⏹️');
    }
  };

  const handleQASession = () => {
    alert('Starting Q/A Session...');
  };

  const handleUploadDocuments = () => {
    alert('Upload All Documents');
  };

  const handleScheduleMeeting = () => {
    alert('Schedule Your Meeting');
  };

  return (
    <div className="host-page">
      {/* Top bar */}
      <header className="topbar">
        <div className="left-group">
          <button
            type="button"
            className="back-btn"
            onClick={() => window.history.back()}
            aria-label="Go back"
            title="Go back"
          >
            <FiArrowLeft />
          </button>
          <h1 className="brand brand--xl">Rural Meet</h1>
        </div>

        <div className="right-icons">
          <button className="icon-btn" aria-label="Help" title="Help">
            <FiHelpCircle />
          </button>
          <button className="icon-btn" aria-label="Settings" title="Settings">
            <FiSettings />
          </button>
          <button 
            className="icon-btn profile-btn" 
            aria-label="Profile"
            onClick={() => setShowProfile(!showProfile)}
          >
            <FiUser />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <div className="profile-avatar">JD</div>
                <div className="profile-details">
                  <h3>John Doe</h3>
                  <p>john.doe@email.com</p>
                </div>
              </div>
              <button className="dropdown-btn" onClick={() => alert('View Profile')}>
                View Profile
              </button>
              <button className="dropdown-btn" onClick={() => alert('My Recordings')}>
                My Recordings
              </button>
              <button className="dropdown-btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Layout */}
      <div className="host-layout">
        {/* Left rail */}
        <aside className="side-rail">
          <button className="pill strong">
            Host Section <span className="emoji">😊</span>
          </button>

          <button className="pill outline">
            Participant Section <FiChevronRight />
          </button>
        </aside>

        {/* Vertical divider */}
        <div className="divider-vert" aria-hidden="true" />

        {/* Main panel */}
        <main className="stage">
          <section className="panel hero">
            <div className="hero-inner">
              <h2 className="hero-title">Create Meeting</h2>
              <p className="hero-subtitle">Start your meeting journey here.</p>

              {/* Meeting Card with Image */}
              <div className="meeting-card">
                <img 
                  src={posterImg} 
                  alt="Meeting interface preview" 
                  className="meeting-preview-image"
                />
              </div>

              <div className="hero-actions">
                <div className="tooltip-wrapper">
                  <button
                    type="button"
                    className="round-plus round-plus--blackBorder"
                    onClick={handleStartMeeting}
                    aria-label="Join Meeting"
                    title="Join Meeting"
                  >

                    +
                  </button>
                  <span className="tooltip">Join Meeting</span>
                </div>

                <div className="tooltip-wrapper">
                  <button
                    type="button"
                    className={`toggle toggle--black ${recordMeeting ? 'on' : ''}`}
                    aria-pressed={recordMeeting}
                    onClick={handleToggleRecording}
                    title="Recording"
                  >
                    <span className="knob" />
                  </button>
                  <span className="tooltip">{recordMeeting ? 'Stop Recording' : 'Start Recording'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Feature Cards Section - Separate Panel */}
          <section className="panel features-panel">
            <div className="features-section">
              {/* Q/A Session Card */}
              <div className="feature-card">
                <div className="feature-icon">
                  <FiMessageSquare />
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">Start Q/A session</h3>
                  <p className="feature-description">
                    re-revise what you've discussed during meeting.
                  </p>
                </div>
                <button className="get-started-btn" onClick={handleQASession}>
                  Get started <FiArrowRight />
                </button>
              </div>

              {/* Upload Documents Card */}
              <div className="feature-card">
                <div className="feature-icon">
                  <FiUpload />
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">Upload Documents</h3>
                  <p className="feature-description">
                    Upload notes, documents, files and etc and use them anytime.
                  </p>
                </div>
                <button className="get-started-btn" onClick={handleUploadDocuments}>
                  Get started <FiArrowRight/>
                </button>
              </div>

              {/* Schedule Meeting Card */}
              <div className="feature-card">
                <div className="feature-icon">
                  <FiCalendar />
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">Schedule Meeting</h3>
                  <p className="feature-description">
                    Create meeting for later and get the link ready.
                  </p>
                </div>
                <button className="get-started-btn" onClick={handleScheduleMeeting}>
                  Get started <FiArrowRight/>
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}