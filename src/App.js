// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './components/LandingPage';
import MeetingWindow from './components/MeetingWindow';
import PreMeetingSetup from './components/PreMeetingSetup';
import Login from './components/Login';
import Host from './components/Host';
import DocumentUpload from './components/DocumentUpload';
import { ClassroomProvider } from './context/ClassroomContext';
// import './App.css';

export default function App() {
  return (
    <ClassroomProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/meeting" element={<MeetingWindow />} />
            <Route path="/pre-meeting" element={<PreMeetingSetup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/upload" element={<DocumentUpload />} />
            <Route path="/host" element={<Host />} />
          </Routes>
        </div>
      </Router>
    </ClassroomProvider>
  );
}