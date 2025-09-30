// src/components/MeetingWindow.jsx
import React, { useState } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Hand, PhoneOff, Send, Smile
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const MeetingWindow = () => {
  const navigate = useNavigate();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'John Doe', message: 'Hello everyone!', time: '10:30 AM' },
    { id: 2, user: 'Jane Smith', message: 'Great to be here', time: '10:31 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const participants = [
    { id: 1, name: 'Sarah Johnson', isMuted: false, isVideoOff: false },
    { id: 2, name: 'Mike Chen', isMuted: true,  isVideoOff: false },
    { id: 3, name: 'Alex Kumar', isMuted: false, isVideoOff: false },
    { id: 4, name: 'Emily Davis', isMuted: true,  isVideoOff: false },
    { id: 5, name: 'David Wilson', isMuted: true,  isVideoOff: true  },
    { id: 6, name: 'Lisa Anderson', isMuted: true,  isVideoOff: true  }
  ];

  const gradsFrom = ['#8B7355', '#B89968', '#D4AF6A', '#A67C52', '#8B6F47', '#C9A961'];
  const gradsTo   = ['#E8D4B8', '#F5E6D3', '#FFE5B4', '#DEB887', '#D2B48C', '#F0E68C'];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages(prev => ([
      ...prev,
      {
        id: prev.length + 1,
        user: 'You',
        message: newMessage,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    ]));
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const handleEndCall = () => {
    if (window.confirm('End the call?')) {
      navigate('/'); // go back to home; change if needed
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#000',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Left: Video area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Rounded grid container */}
        <div style={{ flex: 1, padding: 12, position: 'relative' }}>
          <div style={{
            height: '100%',
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: '#000',
            border: '1px solid #1a1a1a'
          }}>
            <div style={{
              height: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridTemplateRows: 'repeat(3, 1fr)',
              gap: 4,
              padding: 0,
              backgroundColor: '#000'
            }}>
              {participants.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    position: 'relative',
                    backgroundColor: '#1a1a1a',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* Fake video stream */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: p.isVideoOff
                      ? '#1a1a1a'
                      : `linear-gradient(135deg, ${gradsFrom[idx]} 20%, ${gradsTo[idx]} 80%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {p.isVideoOff && (
                      <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        backgroundColor: '#3a3a3a',
                        color: '#fff', fontWeight: 700, fontSize: 28,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {p.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                  </div>

                  {/* Mute badge bottom-left */}
                  <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 8,
                      background: 'rgba(0,0,0,.65)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {p.isMuted ? <MicOff size={16} color="#fff" /> : <Mic size={16} color="#fff" />}
                    </div>
                  </div>

                  {/* Name label */}
                  <div style={{ position: 'absolute', bottom: 8, left: 44 }}>
                    <span style={{
                      color: '#fff', fontSize: 14,
                      backgroundColor: 'rgba(0,0,0,.6)',
                      padding: '4px 10px', borderRadius: 6, fontWeight: 500
                    }}>
                      {p.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating control bar */}
        <div style={{
          position: 'absolute',
          left: '50%',
          bottom: 14,
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          backgroundColor: '#121212',
          padding: '10px 14px',
          borderRadius: 36,
          boxShadow: '0 14px 40px rgba(0,0,0,.45)',
          zIndex: 5
        }}>
          {/* Mic */}
          <button
            onClick={() => setIsMicOn(v => !v)}
            title="Toggle microphone"
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: isMicOn ? '#fff' : '#4a4a4a',
              border: '1px solid #e5e7eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {isMicOn ? <Mic size={24} color="#000" /> : <MicOff size={24} color="#fff" />}
          </button>

          {/* Video */}
          <button
            onClick={() => setIsVideoOn(v => !v)}
            title="Toggle camera"
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: isVideoOn ? '#fff' : '#4a4a4a',
              border: '1px solid #e5e7eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {isVideoOn ? <Video size={24} color="#000" /> : <VideoOff size={24} color="#fff" />}
          </button>

          {/* Hand */}
          <button
            onClick={() => setIsHandRaised(v => !v)}
            title="Raise hand"
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#fff',
              border: '1px solid #e5e7eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Hand size={24} color={isHandRaised ? '#eab308' : '#000'} />
          </button>

          {/* CC */}
          <button
            title="Closed captions"
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#fff', border: '1px solid #e5e7eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 16, cursor: 'pointer'
            }}
          >
            CC
          </button>

          {/* End call */}
          <button
            onClick={handleEndCall}
            title="End call"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: '0 18px',
              height: 56, borderRadius: 28,
              background: '#e11d48', color: '#fff', border: 'none',
              cursor: 'pointer', fontWeight: 700
            }}
          >
            <PhoneOff size={22} color="#fff" />
            End
          </button>
        </div>
      </div>

      {/* Right: Sidebar */}
      <div style={{
        width: 430,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #e5e7eb',
        position: 'relative'
      }}>
        {/* Centered pill tabs */}
        <div style={{
          padding: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 5,
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            background: '#0e0e0e',
            borderRadius: 999,
            padding: 6,
            display: 'inline-flex',
            gap: 6
          }}>
            {['chats', 'polls', 'documents'].map(tab => {
              const isActive = activeTab === tab;
              const label = tab[0].toUpperCase() + tab.slice(1);
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 999,
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive ? '#fff' : 'transparent',
                    color: isActive ? '#0e0e0e' : '#fff',
                    fontWeight: 700,
                    fontSize: 16
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Chats */}
          {activeTab === 'chats' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
                {chatMessages.map((msg) => (
                  <div key={msg.id} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{msg.user}</span>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>{msg.time}</span>
                    </div>
                    <div style={{
                      background: '#f3f4f6',
                      padding: '10px 12px',
                      borderRadius: 10,
                      fontSize: 14,
                      color: '#374151'
                    }}>
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>

              {/* Emoji picker (full) */}
              {showEmojiPicker && (
                <div style={{
                  position: 'absolute',
                  left: 16,
                  bottom: 88,
                  zIndex: 20,
                  boxShadow: '0 20px 50px rgba(0,0,0,.25)',
                  borderRadius: 12,
                  overflow: 'hidden'
                }}>
                  <Picker
                    data={data}
                    onEmojiSelect={(emoji) => setNewMessage(prev => prev + (emoji.native || ''))}
                    theme="light"
                    previewPosition="none"
                    searchPosition="none"
                    skinTonePosition="none"
                  />
                </div>
              )}

              {/* Composer */}
              <div style={{
                padding: 16,
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                gap: 8,
                alignItems: 'center'
              }}>
                <button
                  onClick={() => setShowEmojiPicker(v => !v)}
                  style={{
                    padding: 8, background: 'transparent',
                    border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer'
                  }}
                  aria-label="Emoji picker"
                >
                  <Smile size={20} color="#6b7280" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  style={{
                    padding: '10px 16px',
                    background: '#0e0e0e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Polls */}
          {activeTab === 'polls' && (
            <div style={{ padding: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: '#111827' }}>
                Active Polls
              </h3>
              <div style={{ background: '#f9fafb', padding: 16, borderRadius: 10, marginBottom: 16 }}>
                <p style={{ fontWeight: 600, marginBottom: 12, color: '#374151' }}>
                  What time works best for the next meeting?
                </p>
                {['9:00 AM', '2:00 PM', '5:00 PM'].map((option, idx) => (
                  <button
                    key={idx}
                    style={{
                      width: '100%',
                      padding: 10,
                      marginBottom: 8,
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 14
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {activeTab === 'documents' && (
            <div style={{ padding: '26px 22px 40px' }}>
              <h1 style={{ fontSize: 34, fontWeight: 800, textAlign: 'center', marginBottom: 20, color: '#111' }}>
                What is Lorem Ipsum?
              </h1>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: '#333', margin: '0 auto 24px', maxWidth: 640 }}>
                <strong>Lorem Ipsum</strong> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled
                it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic
                typesetting, remaining essentially unchanged. It was Lorem Ipsum passages, and more recently with desktop publishing
                software like Aldus PageMaker including versions of Lorem Ipsum.
              </p>

              <h2 style={{ fontSize: 30, fontWeight: 800, textAlign: 'center', margin: '36px 0 12px', color: '#111' }}>
                Why do we use it?
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: '#333', margin: '0 auto 24px', maxWidth: 640 }}>
                It is a long established fact that a reader will be distracted by the readable content of a page when looking at its
                layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to
                using 'Content here, content here', making websites still in their infancy. Various versions have evolved over the
                years, sometimes by accident, sometimes on purpose (injected humour and the like).
              </p>

              <h2 style={{ fontSize: 30, fontWeight: 800, textAlign: 'center', margin: '36px 0 12px', color: '#111' }}>
                Where does it come from?
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: '#333', margin: '0 auto', maxWidth: 640 }}>
                Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin
                literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney
                College in Virginia, looked up one of the more obscure Latin words, consectetur...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingWindow;