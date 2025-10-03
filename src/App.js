// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MeetingWindow from './components/MeetingWindow';
import PreMeetingSetup from './components/PreMeetingSetup';
import Login from './components/Login';
import DocumentUpload from './components/DocumentUpload';
import { ClassroomProvider } from './context/ClassroomContext';
import './App.css';

function App() {
  return (
    <ClassroomProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/meeting" element={<MeetingWindow />} />
            <Route path="/pre-meeting" element={<PreMeetingSetup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/upload-documents" element={<DocumentUpload />} />
          </Routes>
        </div>
      </Router>
    </ClassroomProvider>
  );
}

export default App;