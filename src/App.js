// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import RuralMeetLogin from './components/RuralMeetLogin';
import MeetingWindow from './components/MeetingWindow';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<RuralMeetLogin />} />
          <Route path="/meeting" element={<MeetingWindow />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;