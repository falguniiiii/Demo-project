import React, { useMemo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Hand, PhoneOff, Send, Smile, FileText, PlusCircle, XCircle, Upload } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import './MeetingWindow.css';

export default function MeetingWindow() {
  const navigate = useNavigate();
  const location = useLocation();

  const userName = location.state?.userName || 'Guest';
  const initialMicState = location.state?.initialMicState ?? true;
  const initialVideoState = location.state?.initialVideoState ?? true;

  const [isHost] = useState(true);
  const [isMicOn, setIsMicOn] = useState(initialMicState);
  const [isVideoOn, setIsVideoOn] = useState(initialVideoState);
  const [isHandRaised, setIsHandRaised] = useState(false);

  const [captionsOn, setCaptionsOn] = useState(false);
  const [captions, setCaptions] = useState([]);
  const recognitionRef = useRef(null);
  const [captionError, setCaptionError] = useState('');

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setCaptionError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setCaptions(prev => {
          const newCaptions = [...prev, finalTranscript.trim()];
          // Keep only last 10 captions
          return newCaptions.slice(-10);
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setCaptionError('Microphone access denied for captions');
      } else if (event.error === 'no-speech') {
        // Restart recognition on no-speech error
        if (captionsOn) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              console.log('Recognition restart error:', e);
            }
          }, 100);
        }
      }
    };

    recognition.onend = () => {
      // Auto-restart if captions are still on
      if (captionsOn) {
        try {
          recognition.start();
        } catch (e) {
          console.log('Recognition restart error:', e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition stop error:', e);
        }
      }
    };
  }, []);

  // Start/stop recognition based on captionsOn state
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (captionsOn && isMicOn) {
      setCaptionError('');
      try {
        recognitionRef.current.start();
        console.log('🎤 Speech recognition started');
      } catch (e) {
        if (e.message.includes('already started')) {
          console.log('Recognition already running');
        } else {
          console.error('Failed to start recognition:', e);
          setCaptionError('Failed to start captions');
        }
      }
    } else {
      try {
        recognitionRef.current.stop();
        console.log('⏹️ Speech recognition stopped');
      } catch (e) {
        console.log('Recognition stop error:', e);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Cleanup stop error:', e);
        }
      }
    };
  }, [captionsOn, isMicOn]);

  const [activeTab, setActiveTab] = useState('documents');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const [polls, setPolls] = useState([]);
  const [myVotes, setMyVotes] = useState({});
  const [creatingPoll, setCreatingPoll] = useState(false);
  const [newPollQ, setNewPollQ] = useState('');
  const [newPollOptions, setNewPollOptions] = useState('');

  const guessType = (name = '') => {
    const n = name.toLowerCase();
    if (n.endsWith('.pdf')) return 'application/pdf';
    if (n.endsWith('.png')) return 'image/png';
    if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
    return '';
  };

  const normalizeDocs = (arr = []) =>
    arr.filter(d => d && d.url && d.name).map((d, idx) => ({
      id: d.id || `${Date.now()}-${idx}`,
      name: d.name,
      url: d.url,
      type: d.type || guessType(d.name)
    }));

  const initialDocs = useMemo(() => {
    const fromState = Array.isArray(location.state?.docs) ? location.state.docs : null;
    if (fromState) return normalizeDocs(fromState);
    return [];
  }, [location.state]);

  const [documents, setDocuments] = useState(initialDocs);
  const [activeDocId, setActiveDocId] = useState(initialDocs[0]?.id || null);

  const activeDoc = useMemo(
    () => documents.find(d => d.id === activeDocId) || null,
    [documents, activeDocId]
  );

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
    setDocuments(prev => [...prev, ...list]);
    setActiveDocId(list[list.length - 1].id);
  };

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

  const selfId = 'self';

  // Start with only the local user (host)
  const [participants, setParticipants] = useState([
    { id: selfId, name: userName, isMuted: !isMicOn, isVideoOff: !isVideoOn, isLocal: true }
  ]);

  useEffect(() => {
    setParticipants(prev =>
      prev.map(p => p.id === selfId ? { ...p, isMuted: !isMicOn, isVideoOff: !isVideoOn } : p)
    );
  }, [isMicOn, isVideoOn]);

  // Calculate grid columns dynamically based on participant count
  // For 90+ people, we'll use a more compact grid
  const getGridLayout = (count) => {
    if (count <= 4) return { cols: 2, rows: 2 };
    if (count <= 9) return { cols: 3, rows: 3 };
    if (count <= 16) return { cols: 4, rows: 4 };
    if (count <= 25) return { cols: 5, rows: 5 };
    if (count <= 36) return { cols: 6, rows: 6 };
    if (count <= 49) return { cols: 7, rows: 7 };
    if (count <= 64) return { cols: 8, rows: 8 };
    if (count <= 81) return { cols: 9, rows: 9 };
    // For 90+ participants
    return { cols: 10, rows: Math.ceil(count / 10) };
  };

  const gridLayout = getGridLayout(participants.length);

  const selfVideoRef = useRef(null);
  const streamRef = useRef(null);
  const [mediaError, setMediaError] = useState('');

  const stopAllTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (selfVideoRef.current) {
      selfVideoRef.current.srcObject = null;
    }
  };

  const manageMediaTracks = async () => {
    try {
      console.log('🎥 manageMediaTracks called', { isMicOn, isVideoOn });
      setMediaError('');
      
      if (streamRef.current) {
        console.log('🛑 Stopping existing tracks');
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (!isMicOn && !isVideoOn) {
        console.log('❌ Both off, clearing video');
        if (selfVideoRef.current) {
          selfVideoRef.current.srcObject = null;
        }
        return;
      }

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
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      console.log('✅ Got stream with tracks:', stream.getTracks().map(t => t.kind));

      if (selfVideoRef.current) {
        if (isVideoOn) {
          console.log('🎬 Setting video srcObject');
          selfVideoRef.current.srcObject = stream;
          selfVideoRef.current.muted = true;
        } else {
          selfVideoRef.current.srcObject = null;
        }
      } else {
        console.log('⚠️ selfVideoRef.current is null!');
      }

    } catch (e) {
      console.error('❌ Media error:', e);
      setMediaError(e?.message || 'Could not access camera/microphone');
    }
  };

  useEffect(() => {
    manageMediaTracks();
    return () => {
      stopAllTracks();
    };
  }, []);

  useEffect(() => {
    manageMediaTracks();
  }, [isMicOn, isVideoOn]);

  const onToggleMic = () => {
    setIsMicOn(prev => !prev);
  };

  const onToggleVideo = () => {
    setIsVideoOn(prev => !prev);
  };

  const handleEndCall = () => {
    if (window.confirm('End the call?')) {
      stopAllTracks();
      navigate('/');
    }
  };

  const isImage = (doc) => doc?.type?.startsWith('image/');
  const isPdf = (doc) => (doc?.type === 'application/pdf') || /\.pdf$/i.test(doc?.name || '');
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

  const addPoll = () => {
    const q = newPollQ.trim();
    const opts = newPollOptions.split('\n').map(s => s.trim()).filter(Boolean);
    if (!q || opts.length < 2) {
      alert('Add a question and at least 2 options.');
      return;
    }
    const id = `p-${Date.now()}`;
    setPolls(prev => [{
      id,
      question: q,
      options: opts.map((t, i) => ({ id: `o-${i}-${Date.now()}`, text: t, votes: 0 })),
      status: 'open'
    }, ...prev]);
    setCreatingPoll(false);
    setNewPollQ('');
    setNewPollOptions('');
  };

  const closePoll = (pollId) => setPolls(prev => prev.map(p => p.id === pollId ? { ...p, status: 'closed' } : p));

  const gradsFrom = ['#8B7355', '#B89968', '#D4AF6A', '#A67C52', '#8B6F47'];
  const gradsTo = ['#E8D4B8', '#F5E6D3', '#FFE5B4', '#DEB887', '#D2B48C'];

  function handleSend() {
    const trimmed = newMessage.trim();
    if (!trimmed) return;
    setChatMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        user: userName,
        message: trimmed,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setNewMessage('');
    setShowEmojiPicker(false);
  }

  return (
    <div className="meeting">
      <div className="meeting__left">
        <div className="meeting__grid-pad">
          <div className="meeting__grid-wrap">
            <div 
              className="meeting__grid" 
              style={{ 
                gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
                gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)` 
              }}
            >
              {participants.map((p, idx) => {
                const isLocal = p.isLocal;
                const muted = isLocal ? !isMicOn : p.isMuted;
                const vOff = isLocal ? !isVideoOn : p.isVideoOff;

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
                      {isLocal && isVideoOn && (
                        <video
                          ref={selfVideoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                        />
                      )}
                      {vOff && (
                        <div className="tile__avatar">
                          {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                    </div>

                    <div className="tile__badge">
                      {muted ? <MicOff size={16} color="#fff" /> : <Mic size={16} color="#fff" />}
                    </div>
                    <div className="tile__name">{p.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {captionsOn && (
          <div className="captions">
            {captionError && (
              <div className="captions__error" style={{ color: '#ef4444', marginBottom: '0.5rem' }}>
                {captionError}
              </div>
            )}
            {!captionError && captions.length === 0 && isMicOn && (
              <div className="captions__line" style={{ opacity: 0.6 }}>
                Listening... Start speaking to see captions
              </div>
            )}
            {!isMicOn && (
              <div className="captions__line" style={{ color: '#eab308' }}>
                Microphone is muted - turn on mic for captions
              </div>
            )}
            {captions.map((line, i) => (
              <div key={i} className="captions__line">{line}</div>
            ))}
          </div>
        )}

        {mediaError && (
          <div style={{
            position: 'absolute', left: 16, bottom: 86, zIndex: 10,
            background: 'rgba(0,0,0,.75)', color: '#fff', padding: '8px 10px',
            borderRadius: 8, fontSize: 12, maxWidth: 360
          }}>
            {mediaError}
          </div>
        )}

        <div className="controls">
          <button onClick={onToggleMic} className={`btn-round ${!isMicOn ? 'btn-round--off' : ''}`}>
            {isMicOn ? <Mic size={24} color="#000" /> : <MicOff size={24} color="#fff" />}
          </button>

          <button onClick={onToggleVideo} className={`btn-round ${!isVideoOn ? 'btn-round--off' : ''}`}>
            {isVideoOn ? <Video size={24} color="#000" /> : <VideoOff size={24} color="#fff" />}
          </button>

          <button onClick={() => setIsHandRaised(v => !v)} className="btn-round">
            <Hand size={24} color={isHandRaised ? '#eab308' : '#000'} />
          </button>

          <button
            onClick={() => {
              if (!captionsOn && !isMicOn) {
                alert('Please turn on your microphone to enable captions');
                return;
              }
              setCaptionsOn(v => !v);
            }}
            className="btn-round"
            style={{ background: captionsOn ? '#0e0e0e' : '#fff', color: captionsOn ? '#fff' : '#000' }}
            title={captionsOn ? 'Turn off captions' : 'Turn on captions'}
          >
            CC
          </button>

          <button onClick={handleEndCall} className="btn-pill-danger">
            <PhoneOff size={22} color="#fff" />
            End
          </button>
        </div>
      </div>

      <aside className="meeting__right">
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  multiple
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  style={{ display: 'none' }}
                />
                <button className="tabs__btn" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={16} />
                  <span>Upload</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="content">
          {activeTab === 'chats' && (
            <div className="chats">
              <div className="chats__list">
                {chatMessages.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    No messages yet. Start the conversation!
                  </div>
                )}
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
                >
                  <Smile size={20} color="#6b7280" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="input"
                />
                <button onClick={handleSend} className="send-btn">
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'polls' && (
            <div className="polls">
              {isHost && (
                <div className="polls__creator">
                  <button className="creator__toggle" onClick={() => setCreatingPoll(v => !v)}>
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
                        placeholder="Option A&#10;Option B&#10;Option C"
                        rows={4}
                        className="creator__textarea"
                      />
                      <button onClick={addPoll} className="creator__create">Add Poll</button>
                    </div>
                  )}
                </div>
              )}

              <div className="polls__list">
                {polls.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    No polls yet. {isHost && 'Create one to get started!'}
                  </div>
                )}
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
                            <button className="poll-close" onClick={() => closePoll(poll.id)}>Close</button>
                          )}
                        </div>
                      </div>

                      {!hasVoted ? (
                        <div className="poll-options">
                          {poll.options.map(opt => (
                            <button key={opt.id} className="poll-option" onClick={() => vote(poll.id, opt.id)}>
                              {opt.text}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="poll-results">
                          {poll.options.map(opt => {
                            const pct = percent(opt.votes, total);
                            return (
                              <div key={opt.id} className="result-row">
                                <div className="result-top">
                                  <span className="result-label">{opt.text}</span>
                                  <span className="result-pct">{pct}%</span>
                                </div>
                                <div className="progress">
                                  <div className="progress__value" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="result-votes">{opt.votes} vote{opt.votes !== 1 ? 's' : ''}</div>
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

          {activeTab === 'documents' && (
            <div className="docs">
              <div className="docs__bar">
                <h3 className="docs__title">Documents</h3>
                {activeDoc && (
                  <div className="docs__actions">
                    <a href={activeDoc.url} target="_blank" rel="noreferrer" className="docs__btn docs__btn--open">
                      Open
                    </a>
                  </div>
                )}
              </div>

              <div className="docs__list">
                {documents.length === 0 && <div className="docs__empty">No documents available.</div>}
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setActiveDocId(doc.id)}
                    className={`doc-pill ${doc.id === activeDocId ? 'active' : ''}`}
                  >
                    <FileText size={16} />
                    <span className="doc-pill__name">{doc.name}</span>
                  </div>
                ))}
              </div>

              <div className="docs__viewer">
                {activeDoc ? (
                  <>
                    {isImage(activeDoc) && <img src={activeDoc.url} alt={activeDoc.name} className="docs__img" />}
                    {isPdf(activeDoc) && <iframe title={activeDoc.name} src={activeDoc.url} className="docs__iframe" />}
                    {!isImage(activeDoc) && !isPdf(activeDoc) && (
                      <div className="docs__unsupported">Preview not available. Click Open to view.</div>
                    )}
                  </>
                ) : (
                  <div className="docs__empty">Select a document to view.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}