// src/components/MeetingWindow.jsx
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, Hand, PhoneOff, Send, Smile, FileText, PlusCircle, XCircle
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import './MeetingWindow.css';

const RIGHT_WIDTH = '47%'; // fixed right panel width on all tabs

export default function MeetingWindow() {
  const navigate = useNavigate();
  const location = useLocation();

  // Toggle to false to see participant view (no poll creation)
  const [isHost] = useState(true);

  // AV controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState('documents'); // 'chats' | 'polls' | 'documents'
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'John Doe', message: 'Hello everyone!', time: '10:30 AM' },
    { id: 2, user: 'Jane Smith', message: 'Great to be here', time: '10:31 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Polls state (works: create/close if host, vote once per poll, show results)
  const [polls, setPolls] = useState([
    {
      id: 'p-1',
      question: 'What time works best for the next meeting?',
      options: [
        { id: 'o-1', text: '9:00 AM', votes: 1 },
        { id: 'o-2', text: '2:00 PM', votes: 2 },
        { id: 'o-3', text: '5:00 PM', votes: 0 }
      ],
      status: 'open' // 'open' | 'closed'
    }
  ]);
  const [myVotes, setMyVotes] = useState({}); // { [pollId]: optionId }
  const [creatingPoll, setCreatingPoll] = useState(false);
  const [newPollQ, setNewPollQ] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(''); // one option per line

  // Documents (preloaded only — view, open, download)
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

  // Read preloaded docs from route state or localStorage
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

  // Emoji picker close on outside click
  const emojiPickerRef = useRef(null);
  useEffect(() => {
    const onClick = (e) => {
      const btn = e.target.closest('[data-emoji-button="true"]');
      if (btn) return;
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Participants (visual only)
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

  // Chat
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        user: 'You',
        message: newMessage,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  // Call end
  const handleEndCall = () => {
    if (window.confirm('End the call?')) navigate('/');
  };

  // Docs helpers
  const isImage = (doc) => doc?.type?.startsWith('image/');
  const isPdf   = (doc) => (doc?.type === 'application/pdf') || /\.pdf$/i.test(doc?.name || '');

  // Polls logic
  const totalVotes = (poll) => poll.options.reduce((a, o) => a + o.votes, 0);
  const percent = (part, total) => total === 0 ? 0 : Math.round((part / total) * 100);

  const vote = (pollId, optionId) => {
    if (myVotes[pollId]) return; // already voted
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId || p.status !== 'open') return p;
      return {
        ...p,
        options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o)
      };
    }));
    setMyVotes(prev => ({ ...prev, [pollId]: optionId }));
  };

  const toggleCreatePoll = () => setCreatingPoll(v => !v);
  const addPoll = () => {
    const q = newPollQ.trim();
    const opts = newPollOptions.split('\n').map(s => s.trim()).filter(Boolean);
    if (!q || opts.length < 2) {
      alert('Add a question and at least 2 options (each on a new line).');
      return;
    }
    const id = `p-${Date.now()}`;
    setPolls(prev => [
      {
        id,
        question: q,
        options: opts.map((t, i) => ({ id: `o-${i}-${Date.now()}`, text: t, votes: 0 })),
        status: 'open'
      },
      ...prev
    ]);
    setCreatingPoll(false);
    setNewPollQ('');
    setNewPollOptions('');
  };

  const closePoll = (pollId) => {
    setPolls(prev => prev.map(p => p.id === pollId ? { ...p, status: 'closed' } : p));
  };

  return (
    <div className="meeting">
      {/* Left: Video area */}
      <div className="meeting__left">
        <div className="meeting__grid-pad">
          <div className="meeting__grid-wrap">
            <div className="meeting__grid">
              {participants.map((p, idx) => (
                <div key={p.id} className="tile">
                  <div
                    className="tile__video"
                    style={{
                      background: p.isVideoOff
                        ? '#1a1a1a'
                        : `linear-gradient(135deg, ${gradsFrom[idx]} 20%, ${gradsTo[idx]} 80%)`
                    }}
                  />
                  <div className="tile__badge">
                    {p.isMuted ? <MicOff size={16} color="#fff" /> : <Mic size={16} color="#fff" />}
                  </div>
                  <div className="tile__name">{p.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating controls */}
        <div className="controls">
          <button
            onClick={() => setIsMicOn(v => !v)}
            className={`btn-round ${!isMicOn ? 'btn-round--off' : ''}`}
            title="Toggle microphone"
          >
            {isMicOn ? <Mic size={24} color="#000" /> : <MicOff size={24} color="#fff" />}
          </button>

          <button
            onClick={() => setIsVideoOn(v => !v)}
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

          <button className="btn-round" title="Closed captions" style={{ fontWeight: 800, fontSize: 16 }}>
            CC
          </button>

          <button onClick={handleEndCall} className="btn-pill-danger" title="End call">
            <PhoneOff size={22} color="#fff" />
            End
          </button>
        </div>
      </div>

      {/* Right: Sidebar (fixed 47%) */}
      <aside className="meeting__right" style={{ flex: `0 0 ${RIGHT_WIDTH}`, width: RIGHT_WIDTH, maxWidth: RIGHT_WIDTH }}>
        {/* Tabs */}
        <div className="tabs">
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

              {showEmojiPicker && (
                <div ref={emojiPickerRef} className="emoji-picker">
                  <EmojiPicker
                    onEmojiClick={(emoji) => setNewMessage(prev => prev + emoji.emoji)}
                    theme="light"
                    lazyLoadEmojis
                    searchDisabled={false}
                    skinTonesDisabled={false}
                    previewConfig={{ showPreview: false }}
                    height={360}
                    width={320}
                  />
                </div>
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="input"
                />
                <button onClick={handleSendMessage} className="send-btn">
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

          {/* Documents (preloaded only; no uploads here) */}
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
}