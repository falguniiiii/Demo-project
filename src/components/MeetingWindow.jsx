// src/components/MeetingWindow.jsx
import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, Hand, PhoneOff, Send, Smile, Trash2, Upload, FileText
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

export default function MeetingWindow() {
  const navigate = useNavigate();

  // Simulate role: set true for host-only controls
  const [isHost] = useState(true);

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

  // Documents state
  const [documents, setDocuments] = useState([]); // [{id, name, url, type, size}]
  const [activeDocId, setActiveDocId] = useState(null);
  const activeDoc = useMemo(
    () => documents.find(d => d.id === activeDocId) || null,
    [documents, activeDocId]
  );
  const fileInputRef = useRef(null);

  const participants = [
    { id: 1, name: 'Sarah Johnson', isMuted: false, isVideoOff: false },
    { id: 2, name: 'Mike Chen',     isMuted: true,  isVideoOff: false },
    { id: 3, name: 'Alex Kumar',    isMuted: false, isVideoOff: false },
    { id: 4, name: 'Emily Davis',   isMuted: true,  isVideoOff: false },
    { id: 5, name: 'David Wilson',  isMuted: true,  isVideoOff: true  },
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
      navigate('/'); // go back to home
    }
  };

  // File uploads (host only)
  const handleFiles = (files) => {
    const list = Array.from(files).map((f, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: f.name,
      url: URL.createObjectURL(f),
      type: f.type || 'application/octet-stream',
      size: f.size
    }));
    setDocuments(prev => {
      const next = [...prev, ...list];
      if (!activeDocId && next.length) setActiveDocId(next[0].id);
      return next;
    });
  };

  const onClickUpload = () => fileInputRef.current?.click();

  const onDeleteDoc = (id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (activeDocId === id) {
      const remaining = documents.filter(d => d.id !== id);
      setActiveDocId(remaining[0]?.id || null);
    }
  };

  const isImage = (doc) => doc?.type.startsWith('image/');
  const isPdf   = (doc) => (doc?.type === 'application/pdf') || /\.pdf$/i.test(doc?.name || '');

  // 40% width for Documents panel
  const rightWidth = activeTab === 'documents' ? '40%' : 430;

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
              backgroundColor: '#000'
            }}>
              {participants.map((p, idx) => (
                <div key={p.id} style={{
                  position: 'relative',
                  backgroundColor: '#1a1a1a',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Video placeholder */}
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

                  {/* Status + name bottom-left */}
                  <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 8,
                      background: 'rgba(0,0,0,.65)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {p.isMuted ? <MicOff size={16} color="#fff" /> : <Mic size={16} color="#fff" />}
                    </div>
                  </div>

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

      {/* Right: Sidebar (40% when on Documents) */}
      <div style={{
        width: rightWidth,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #e5e7eb',
        position: 'relative',
        transition: 'width .25s ease'
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

              {/* Full emoji picker */}
              {showEmojiPicker && (
                <div style={{
                  position: 'absolute',
                  left: 16,
                  bottom: 88,
                  zIndex: 20,
                  boxShadow: '0 20px 50px rgba(0,0,0,.25)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#fff'
                }}>
                  <EmojiPicker
                    onEmojiClick={(emojiData) => setNewMessage(prev => prev + emojiData.emoji)}
                    theme="light"
                    searchDisabled={false}
                    skinTonesDisabled={false}
                    previewConfig={{ showPreview: false }}
                    height={360}
                    width={320}
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

          {/* Documents (host-upload + viewer) */}
          {activeTab === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Top bar for documents */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111' }}>
                  Documents
                </h3>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {isHost ? (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.md,.doc,.docx"
                        multiple
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                        style={{ display: 'none' }}
                      />
                      <button
                        onClick={onClickUpload}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', borderRadius: 8,
                          background: '#0e0e0e', color: '#fff', border: 'none',
                          cursor: 'pointer', fontWeight: 600
                        }}
                        title="Upload documents (host only)"
                      >
                        <Upload size={18} />
                        Upload
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: 13, color: '#6b7280' }}>
                      Only the host can upload documents
                    </span>
                  )}
                </div>
              </div>

              {/* List of docs */}
              <div style={{
                display: 'flex',
                gap: 8,
                padding: '10px 12px',
                overflowX: 'auto',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {documents.length === 0 && (
                  <div style={{ color: '#6b7280', fontSize: 14 }}>
                    No documents yet. {isHost ? 'Click Upload to add PDF/images/docs.' : 'Waiting for host to upload.'}
                  </div>
                )}

                {documents.map(doc => {
                  const active = doc.id === activeDocId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setActiveDocId(doc.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: `1px solid ${active ? '#0e0e0e' : '#e5e7eb'}`,
                        background: active ? '#f3f4f6' : '#fff',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                      title={doc.name}
                    >
                      <FileText size={16} />
                      <span style={{ fontSize: 13, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.name}
                      </span>
                      {isHost && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc.id); }}
                          style={{
                            marginLeft: 4, display: 'inline-flex', alignItems: 'center',
                            border: 'none', background: 'transparent', cursor: 'pointer'
                          }}
                          title="Remove"
                        >
                          <Trash2 size={16} color="#dc2626" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Viewer area */}
              <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, padding: 16, overflow: 'auto' }}>
                  {activeDoc ? (
                    <>
                      {isImage(activeDoc) && (
                        <img
                          src={activeDoc.url}
                          alt={activeDoc.name}
                          style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
                        />
                      )}

                      {isPdf(activeDoc) && (
                        <iframe
                          title={activeDoc.name}
                          src={activeDoc.url}
                          style={{ width: '100%', height: '80vh', border: '1px solid #e5e7eb', borderRadius: 8 }}
                        />
                      )}

                      {!isImage(activeDoc) && !isPdf(activeDoc) && (
                        <div style={{
                          background: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: 8,
                          padding: 16
                        }}>
                          <h4 style={{ marginTop: 0 }}>{activeDoc.name}</h4>
                          <p style={{ color: '#6b7280' }}>
                            Preview not supported. Download to open locally.
                          </p>
                          <a
                            href={activeDoc.url}
                            download={activeDoc.name}
                            style={{
                              display: 'inline-block',
                              padding: '8px 12px',
                              background: '#0e0e0e',
                              color: '#fff',
                              borderRadius: 8,
                              textDecoration: 'none'
                            }}
                          >
                            Download
                          </a>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ maxWidth: 700, margin: '0 auto' }}>
                      <h1 style={{ fontSize: 34, fontWeight: 800, textAlign: 'center', marginBottom: 20, color: '#111' }}>
                        What is Lorem Ipsum?
                      </h1>
                      <p style={{ fontSize: 15, lineHeight: 1.75, color: '#333', margin: '0 auto 24px' }}>
                        <strong>Lorem Ipsum</strong> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                        industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled
                        it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic
                        typesetting, remaining essentially unchanged. It was Lorem Ipsum passages, and more recently with desktop publishing
                        software like Aldus PageMaker including versions of Lorem Ipsum.
                      </p>

                      <h2 style={{ fontSize: 30, fontWeight: 800, textAlign: 'center', margin: '36px 0 12px', color: '#111' }}>
                        Why do we use it?
                      </h2>
                      <p style={{ fontSize: 15, lineHeight: 1.75, color: '#333', margin: '0 auto 24px' }}>
                        It is a long established fact that a reader will be distracted by the readable content of a page when looking at its
                        layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to
                        using 'Content here, content here', making websites still in their infancy. Various versions have evolved over the
                        years, sometimes by accident, sometimes on purpose (injected humour and the like).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}