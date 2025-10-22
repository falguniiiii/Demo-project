import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import './PreMeetingSetup.css';

const PreMeetingSetup = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [userName, setUserName] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllTracks();
    };
  }, []);

  // Handle media changes when mic or video toggle
  useEffect(() => {
    manageMedia();
  }, [isMicOn, isVideoOn]);

 const stopAllTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const manageMedia = async () => {
    try {
      console.log('🎥 PreMeeting manageMedia called', { isMicOn, isVideoOn });
      setMediaError('');

      // Stop all existing tracks first
      if (streamRef.current) {
        console.log('🛑 Stopping existing tracks');
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // If both are off, just clear everything
      if (!isMicOn && !isVideoOn) {
        console.log('❌ Both off, clearing video');
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Request only the tracks we need
      const constraints = {};
      if (isMicOn) {
        constraints.audio = true;
      }
      if (isVideoOn) {
        constraints.video = { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        };
      }

      console.log('📞 Requesting media with constraints:', constraints);

      // Get new stream with required tracks
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      console.log('✅ Got stream with tracks:', stream.getTracks().map(t => t.kind));

      // Update video element if video is on
      if (videoRef.current) {
        if (isVideoOn) {
          console.log('🎬 Setting video srcObject');
          videoRef.current.srcObject = stream;
        } else {
          videoRef.current.srcObject = null;
        }
      } else {
        console.log('⚠️ videoRef.current is null!');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Media error:', error);
      setMediaError('Unable to access camera/microphone. Please check permissions.');
      setIsLoading(false);
      stopAllTracks();
    }
  };

  const handleJoinMeeting = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    stopAllTracks();
    navigate('/meeting', {
      state: {
        userName: userName.trim(),
        initialMicState: isMicOn,
        initialVideoState: isVideoOn,
        hasMediaPermission: !mediaError
      }
    });
  };

  return (
    <div className="pre-meeting">
      <div className="pre-meeting__container">
        <h1 className="pre-meeting__title">Ready to join?</h1>
        <p className="pre-meeting__subtitle">Setup your audio and video before joining</p>

        <div className="pre-meeting__preview">
          {isLoading && (
            <div className="pre-meeting__loading">
              <div className="spinner"></div>
              <p>Loading media...</p>
            </div>
          )}
          
          {!isLoading && (
            <>
              {isVideoOn && !mediaError ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="pre-meeting__video"
                />
              ) : (
                <div className="pre-meeting__avatar">
                  <div className="avatar-circle">
                    {userName ? userName.charAt(0).toUpperCase() : '?'}
                  </div>
                  {!isVideoOn && <p className="camera-off-text">Camera is off</p>}
                </div>
              )}
              
              {mediaError && (
                <div className="pre-meeting__error">{mediaError}</div>
              )}
            </>
          )}
        </div>

        <div className="pre-meeting__controls">
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`pre-meeting__btn ${!isMicOn ? 'pre-meeting__btn--off' : ''}`}
            disabled={isLoading}
          >
            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`pre-meeting__btn ${!isVideoOn ? 'pre-meeting__btn--off' : ''}`}
            disabled={isLoading}
          >
            {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
        </div>

        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleJoinMeeting()}
          placeholder="Enter your name"
          className="pre-meeting__input"
          maxLength={50}
          disabled={isLoading}
        />

        <button
          onClick={handleJoinMeeting}
          className="pre-meeting__join"
          disabled={!userName.trim() || isLoading}
        >
          {isLoading ? 'Loading...' : 'Join Meeting'}
        </button>

        <button
          onClick={() => { stopAllTracks(); navigate('/'); }}
          className="pre-meeting__cancel"
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PreMeetingSetup;
