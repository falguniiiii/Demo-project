// src/components/MeetingWindow.jsx
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Hand, PhoneOff, Send, Smile, FileText, PlusCircle, XCircle, Upload, UserPlus, X}from'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import './MeetingWindow.css';

export default function MeetingWindow() {
  const navigate = useNavigate();
  const location = useLocation();

  // Host/participant
  const [isHost] = useState(true);

  // Local AV states
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // Hand raise
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Captions
  const [captionsOn, setCaptionsOn] = useState(false);
  const [captions, setCaptions] = useState([]);
  const demoLines = [
    'Welcome everyone 👋',
    'We will start in two minutes.',
    'Please mute if you are not speaking.',
    'The deck is in the Documents tab.',
    'Any questions before we move on?',
    'Let’s park this and revisit later.',
    'Thanks for the update!',
  ];
  useEffect(() => {
    let id;
    if (captionsOn) {
      id = setInterval(() => {
        setCaptions(prev => [...prev.slice(-9), demoLines[Math.floor(Math.random() * demoLines.length)]]);
      }, 2200);
    }
    return () => clearInterval(id);
  }, [captionsOn]);

  // Right-panel tabs
  const [activeTab, setActiveTab] = useState('documents'); // 'chats' | 'polls' | 'documents'
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Chats
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'John Doe', message: 'Hello everyone!', time: '10:30 AM' },
    { id: 2, user: 'Jane Smith', message: 'Great to be here', time: '10:31 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Polls
  const [polls, setPolls] = useState([
    {
      id: 'p-1',
      question: 'What time works best for the next meeting?',
      options: [
        { id: 'o-1', text: '9:00 AM', votes: 1 },
        { id: 'o-2', text: '2:00 PM', votes: 2 },
        { id: 'o-3', text: '5:00 PM', votes: 0 }
      ],
      status: 'open'
    }
  ]);
  const [myVotes, setMyVotes] = useState({});
  const [creatingPoll, setCreatingPoll] = useState(false);
  const [newPollQ, setNewPollQ] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(''); // one per line

  // Documents (preloaded + in-meeting upload)
  const guessType = (name = '') => {
    const n = name.toLowerCase();
    if (n.endsWith('.pdf')) return 'application/pdf';
    if (n.endsWith('.png')) return 'image/png';
    if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
    if (n.endsWith('.webp')) return 'image/webp';
    if (n.endsWith('.gif')) return 'image/gif';
    return '';
  };
  const normalizeDocs = (arr = []) =>
    arr
      .filter(d => d && d.url && d.name)
      .map((d, idx) => ({
        id: d.id || `${Date.now()}-${idx}`,
        name: d.name,
        url: d.url,
        type: d.type || guessType(d.name)
      }));

  const initialDocs = useMemo(() => {
    const fromState = Array.isArray(location.state?.docs) ? location.state.docs : null;
    if (fromState) return normalizeDocs(fromState);
    const raw = localStorage.getItem('meetingDocs');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return normalizeDocs(parsed);
      } catch {}
    }
    return [];
  }, [location.state]);

  const [documents, setDocuments] = useState(initialDocs);
  const [activeDocId, setActiveDocId] = useState(initialDocs[0]?.id || null);
  useEffect(() => {
    setDocuments(initialDocs);
    if (initialDocs.length) setActiveDocId(initialDocs[0].id);
  }, [initialDocs]);

  const activeDoc = useMemo(
    () => documents.find(d => d.id === activeDocId) || null,
    [documents, activeDocId]
  );

  // In-meeting upload (host)
  const fileInputRef = useRef(null);
  const handleFiles = (files) => {
    if (!files || !files.length) return;
    const list = Array.from(files).map((f, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: f.name,
      url: URL.createObjectURL(f),
      type: f.type || guessType(f.name),
      _blob: true
    }));
    setDocuments(prev => {
      const next = [...prev, ...list];
      if (!activeDocId && next.length) setActiveDocId(next[0].id);
      return next;
    });
    setActiveDocId(list[list.length - 1].id);
  };
  const openUploader = () => fileInputRef.current?.click();

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      documents.forEach(d => {
        if (d._blob && typeof d.url === 'string' && d.url.startsWith('blob:')) {
          try { URL.revokeObjectURL(d.url); } catch {}
        }
      });
    };
  }, [documents]);

  // Emoji portal
  const emojiPortalRef = useRef(null);
  useEffect(() => {
    const onClick = (e) => {
      const btn = e.target.closest?.('[data-emoji-button="true"]');
      if (btn) return;
      if (emojiPortalRef.current && !emojiPortalRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Participants (dynamic)
  const selfId = 'self';
  const initialRemotes = [
    { id: 'u-1', name: 'Sarah Johnson', isMuted: false, isVideoOff: false },
    { id: 'u-2', name: 'Mike Chen',     isMuted: true,  isVideoOff: false },
    { id: 'u-3', name: 'Alex Kumar',    isMuted: false, isVideoOff: false },
    { id: 'u-4', name: 'Emily Davis',   isMuted: true,  isVideoOff: false },
  ];
  const [participants, setParticipants] = useState([
    { id: selfId, name: 'You', isMuted: !isMicOn, isVideoOff: !isVideoOn, isLocal: true },
    ...initialRemotes
  ]);
  useEffect(() => {
    setParticipants(prev =>
      prev.map(p => p.id === selfId ? { ...p, isMuted: !isMicOn, isVideoOff: !isVideoOn } : p)
    );
  }, [isMicOn, isVideoOn]);

  const guestNames = [
    'Aisha Khan','Ravi Patel','Maria Garcia','Chen Wei','Aarav Sharma',
    'Olivia Brown','Noah Davis','Liam Wilson','Emma Thompson','Lucas Martin','Mia Anderson'
  ];
  const addGuest = () => {
    const name = guestNames[Math.floor(Math.random() * guestNames.length)];
    const id = `u-${Date.now()}`;
    setParticipants(prev => [...prev, { id, name, isMuted: false, isVideoOff: Math.random() < 0.3 }]);
  };
  const removeGuest = (id) => setParticipants(prev => prev.filter(p => p.id !== id));

  // Grid rows adapt to participant count
  const rows = Math.max(3, Math.ceil(participants.length / 2));

  // Local media (real mic/cam)
  const selfVideoRef = useRef(null);
  const streamRef = useRef(null);
  const [mediaError, setMediaError] = useState('');

  const stopStream = (s) => {
    try { s.getTracks().forEach(t => t.stop()); } catch {}
  };

  const ensureMedia = async () => {
    try {
      setMediaError('');
      if (!isMicOn && !isVideoOn) {
        if (streamRef.current) {
          stopStream(streamRef.current);
          streamRef.current = null;
        }
        if (selfVideoRef.current) selfVideoRef.current.srcObject = null;
        return;
      }
      // Re-acquire stream based on current toggles
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: isMicOn,
        video: isVideoOn ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false
      });
      if (streamRef.current) stopStream(streamRef.current);
      streamRef.current = stream;
      if (selfVideoRef.current) selfVideoRef.current.srcObject = stream;
      // Always mute local video element (avoid echo)
      if (selfVideoRef.current) selfVideoRef.current.muted = true;
    } catch (e) {
      const msg = e?.message || 'Could not access camera/microphone';
      setMediaError(msg);
      // If we have an existing stream, just toggle tracks.enabled as fallback
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(t => (t.enabled = isMicOn));
        streamRef.current.getVideoTracks().forEach(t => (t.enabled = isVideoOn));
      }
    }
  };

  // Sync media on toggle changes
  useEffect(() => {
    ensureMedia();
    // Cleanup on unmount
    return () => {
      if (streamRef.current) stopStream(streamRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMicOn, isVideoOn]);

  // Toggle handlers also try to flip existing tracks immediately
  const onToggleMic = () => {
    setIsMicOn(prev => {
      const next = !prev;
      if (streamRef.current) streamRef.current.getAudioTracks().forEach(t => (t.enabled = next));
      return next;
    });
  };
  const onToggleVideo = async () => {
    setIsVideoOn(prev => {
      const next = !prev;
      if (streamRef.current) {
        const vTracks = streamRef.current.getVideoTracks();
        if (vTracks.length) vTracks.forEach(t => (t.enabled = next));
      }
      return next;
    });
  };

  // Leave call
  const handleEndCall = () => {
    if (window.confirm('End the call?')) navigate('/');
  };

  // Docs helpers
  const isImage = (doc) => doc?.type?.startsWith('image/');
  const isPdf   = (doc) => (doc?.type === 'application/pdf') || /\.pdf$/i.test(doc?.name || '');

  // Polls helpers
  const totalVotes = (poll) => poll.options.reduce((a, o) => a + o.votes, 0);
  const percent = (part, total) => total === 0 ? 0 : Math.round((part / total) * 100);
  const vote = (pollId, optionId) => {
    if (myVotes[pollId]) return;
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId || p.status !== 'open') return p;
      return { ...p, options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o) };
    }));
    setMyVotes(prev => ({ ...prev, [pollId]: optionId }));
  };
  const toggleCreatePoll = () => setCreatingPoll(v => !v);
  const addPoll = () => {
    const q = newPollQ.trim();
    const opts = newPollOptions.split('\n').map(s => s.trim()).filter(Boolean);
    if (!q || opts.length < 2) { alert('Add a question and at least 2 options (each on a new line).'); return; }
    const id = `p-${Date.now()}`;
    setPolls(prev => [{ id, question: q, options: opts.map((t, i) => ({ id: `o-${i}-${Date.now()}`, text: t, votes: 0 })), status: 'open' }, ...prev]);
    setCreatingPoll(false); setNewPollQ(''); setNewPollOptions('');
  };
  const closePoll = (pollId) => setPolls(prev => prev.map(p => p.id === pollId ? { ...p, status: 'closed' } : p));

  // Gradients for remote placeholders
  const gradsFrom = ['#8B7355', '#B89968', '#D4AF6A', '#A67C52', '#8B6F47', '#C9A961'];
  const gradsTo   = ['#E8D4B8', '#F5E6D3', '#FFE5B4', '#DEB887', '#D2B48C', '#F0E68C'];

  // Helpers
  const hasLocalVideo = () =>
    !!(streamRef.current && streamRef.current.getVideoTracks().some(t => t.enabled));

  return (
    <div className="meeting">
      {/* Left: Video area */}
      <div className="meeting__left">
        <div className="meeting__grid-pad">
          <div className="meeting__grid-wrap">
            <div
              className="meeting__grid"
              style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}
            >
              {participants.map((p, idx) => {
                const isLocal = p.isLocal;
                const muted = isLocal ? !isMicOn : p.isMuted;
                const vOff  = isLocal ? !isVideoOn : p.isVideoOff;

                return (
                  <div key={p.id} className="tile">
                    <div
                      className="tile__video"
                      style={{
                        background: vOff
                          ? '#1a1a1a'
                          : `linear-gradient(135deg, ${gradsFrom[idx % gradsFrom.length]} 20%, ${gradsTo[idx % gradsTo.length]} 80%)`
                      }}
                    >
                      {isLocal && hasLocalVideo() && (
                        <video
                          ref={selfVideoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                      {vOff && (
                        <div className="tile__avatar">
                          {p.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                      )}
                    </div>

                    <div className="tile__badge">
                      {muted ? <MicOff size={16} color="#fff" /> : <Mic size={16} color="#fff" />}
                    </div>
                    <div className="tile__name">{p.name}</div>

                    {isHost && !isLocal && (
                      <button className="tile__close" title="Remove" onClick={() => removeGuest(p.id)}>
                        <X size={14} color="#fff" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Captions overlay */}
        {captionsOn && (
          <div className="captions">
            {captions.map((line, i) => (
              <div key={i} className="captions__line">{line}</div>
            ))}
          </div>
        )}

        {/* Media error toast */}
        {mediaError && (
          <div style={{
            position: 'absolute', left: 16, bottom: 86, zIndex: 10,
            background: 'rgba(0,0,0,.75)', color: '#fff', padding: '8px 10px',
            borderRadius: 8, fontSize: 12, maxWidth: 360
          }}>
            {mediaError}
          </div>
        )}

        {/* Floating controls */}
        <div className="controls">
          <button
            onClick={onToggleMic}
            className={`btn-round ${!isMicOn ? 'btn-round--off' : ''}`}
            title="Toggle microphone"
          >
            {isMicOn ? <Mic size={24} color="#000" /> : <MicOff size={24} color="#fff" />}
          </button>

          <button
            onClick={onToggleVideo}
            className={`btn-round ${!isVideoOn ? 'btn-round--off' : ''}`}
            title="Toggle camera"
          >
            {isVideoOn ? <Video size={24} color="#000" /> : <VideoOff size={24} color="#fff" />}
          </button>

          <button
            onClick={() => setIsHandRaised(v => !v)}
            className="btn-round"
            title="Raise hand"
          >
            <Hand size={24} color={isHandRaised ? '#eab308' : '#000'} />
          </button>

          <button
            onClick={() => setCaptionsOn(v => !v)}
            className="btn-round"
            title={captionsOn ? 'Turn captions off' : 'Turn captions on'}
            style={{ background: captionsOn ? '#0e0e0e' : '#fff', color: captionsOn ? '#fff' : '#000' }}
          >
            CC
          </button>

          <button onClick={handleEndCall} className="btn-pill-danger" title="End call">
            <PhoneOff size={22} color="#fff" />
            End
          </button>
        </div>
      </div>

      {/* Right: Sidebar */}
      <aside className="meeting__right">
        {/* Tabs + actions */}
        <div className="tabs">
          <div className="tabs__count">{participants.length} joined</div>

          <div className="tabgroup">
            {['chats', 'polls', 'documents'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
              >
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="tabs__actions">
            {isHost && (
              <>
                <button className="tabs__btn" onClick={addGuest} title="Add guest (simulate)">
                  <UserPlus size={16} />
                  <span>Guest</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.md,.doc,.docx"
                  multiple
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  style={{ display: 'none' }}
                />
                <button className="tabs__btn" onClick={openUploader} title="Upload documents">
                  <Upload size={16} />
                  <span>Upload</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="content">
          {/* Chats */}
          {activeTab === 'chats' && (
            <div className="chats">
              <div className="chats__list">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="msg">
                    <div className="msg__head">
                      <span className="msg__user">{msg.user}</span>
                      <span className="msg__time">{msg.time}</span>
                    </div>
                    <div className="msg__bubble">{msg.message}</div>
                  </div>
                ))}
              </div>

              {showEmojiPicker && createPortal(
                <div ref={emojiPortalRef} className="emoji-portal">
                  <EmojiPicker
                    onEmojiClick={(emoji) => setNewMessage(prev => prev + emoji.emoji)}
                    theme="light"
                    lazyLoadEmojis
                    searchDisabled={false}
                    skinTonesDisabled={false}
                    previewConfig={{ showPreview: false }}
                    height={380}
                    width={340}
                  />
                </div>,
                document.body
              )}

              <div className="composer">
                <button
                  data-emoji-button="true"
                  onClick={() => setShowEmojiPicker(v => !v)}
                  className="emoji-btn"
                  aria-label="Emoji picker"
                >
                  <Smile size={20} color="#6b7280" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), setShowEmojiPicker(false), setNewMessage(prev => prev.trim() ? prev : prev), handleSend())}
                  placeholder="Type a message..."
                  className="input"
                />
                <button onClick={handleSend} className="send-btn">
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Polls */}
          {activeTab === 'polls' && (
            <div className="polls">
              {isHost && (
                <div className="polls__creator">
                  <button className="creator__toggle" onClick={toggleCreatePoll}>
                    {creatingPoll ? <><XCircle size={18} /> Cancel</> : <><PlusCircle size={18} /> Create Poll</>}
                  </button>

                  {creatingPoll && (
                    <div className="creator__form">
                      <label className="creator__label">Question</label>
                      <input
                        value={newPollQ}
                        onChange={(e) => setNewPollQ(e.target.value)}
                        placeholder="Type your poll question"
                        className="creator__input"
                      />
                      <label className="creator__label">Options (one per line)</label>
                      <textarea
                        value={newPollOptions}
                        onChange={(e) => setNewPollOptions(e.target.value)}
                        placeholder={`Option A
Option B
Option C`}
                        rows={4}
                        className="creator__textarea"
                      />
                      <div className="creator__actions">
                        <button onClick={addPoll} className="creator__create">Add Poll</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="polls__list">
                {polls.map((poll) => {
                  const total = totalVotes(poll);
                  const votedOptionId = myVotes[poll.id];
                  const hasVoted = !!votedOptionId || poll.status === 'closed';

                  return (
                    <div key={poll.id} className="poll-card">
                      <div className="poll-card__head">
                        <h4 className="poll-card__q">{poll.question}</h4>
                        <div className="poll-card__meta">
                          <span className={`poll-badge ${poll.status}`}>{poll.status}</span>
                          <span className="poll-total">{total} votes</span>
                          {isHost && poll.status === 'open' && (
                            <button className="poll-close" onClick={() => closePoll(poll.id)}>
                              Close
                            </button>
                          )}
                        </div>
                      </div>

                      {!hasVoted ? (
                        <div className="poll-options">
                          {poll.options.map(opt => (
                            <button
                              key={opt.id}
                              className="poll-option"
                              onClick={() => vote(poll.id, opt.id)}
                            >
                              {opt.text}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="poll-results">
                          {poll.options.map(opt => {
                            const pct = percent(opt.votes, total);
                            const isMine = votedOptionId === opt.id;
                            return (
                              <div key={opt.id} className="result-row">
                                <div className="result-top">
                                  <span className="result-label">{opt.text}</span>
                                  <span className="result-pct">{pct}%</span>
                                </div>
                                <div className="progress">
                                  <div className="progress__value" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="result-votes">
                                  {opt.votes} vote{opt.votes !== 1 ? 's' : ''} {isMine && <em>(you)</em>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Documents */}
          {activeTab === 'documents' && (
            <div className="docs">
              <div className="docs__bar">
                <h3 className="docs__title">Documents</h3>
                <div className="docs__actions">
                  {activeDoc && (
                    <>
                      <a
                        href={activeDoc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="docs__btn docs__btn--open"
                        title="Open in new tab"
                      >
                        Open
                      </a>
                      <a
                        href={activeDoc.url}
                        download={activeDoc.name}
                        className="docs__btn docs__btn--download"
                        title="Download"
                      >
                        Download
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="docs__list">
                {documents.length === 0 && (
                  <div className="docs__empty">No documents available.</div>
                )}
                {documents.map(doc => {
                  const active = doc.id === activeDocId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setActiveDocId(doc.id)}
                      className={`doc-pill ${active ? 'active' : ''}`}
                      title={doc.name}
                    >
                      <FileText size={16} />
                      <span className="doc-pill__name">{doc.name}</span>
                    </div>
                  );
                })}
              </div>

              <div className="docs__viewer">
                {activeDoc ? (
                  <>
                    {isImage(activeDoc) && (
                      <img src={activeDoc.url} alt={activeDoc.name} className="docs__img" />
                    )}
                    {isPdf(activeDoc) && (
                      <iframe title={activeDoc.name} src={activeDoc.url} className="docs__iframe" />
                    )}
                    {!isImage(activeDoc) && !isPdf(activeDoc) && (
                      <div className="docs__unsupported">
                        This file type cannot be previewed here. Use Open to view in a new tab.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="docs__empty">Select a document from the list to view it here.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );

  // helper inside component to send message (kept here to keep JSX tidy)
  function handleSend() {
    const trimmed = newMessage.trim();
    if (!trimmed) return;
    setChatMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        user: 'You',
        message: trimmed,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setNewMessage('');
    setShowEmojiPicker(false);
  }
}