// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MeetingWindow from './components/MeetingWindow';
import PreMeetingSetup from './components/PreMeetingSetup';
import Login from './components/Login';
import './App.css';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/meeting" element={<MeetingWindow />} />
          <Route path="/pre-meeting" element={<PreMeetingSetup />} />
          <Route path="/Login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;