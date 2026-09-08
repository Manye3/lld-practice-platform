import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import HomePage from './pages/HomePage';
import PracticePage from './pages/PracticePage';
import HistoryPage from './pages/HistoryPage';
import './App.css';

function App() {
  const [learnerId, setLearnerId] = useState('');

  useEffect(() => {
    let id = localStorage.getItem('learnerId');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('learnerId', id);
    }
    setLearnerId(id);
  }, []);

  if (!learnerId) return null;

  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <Link to="/" className="brand">LLD Practice Platform</Link>
            <nav className="main-nav">
              <Link to="/">Problems</Link>
            </nav>
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage learnerId={learnerId} />} />
            <Route path="/practice/:problemId" element={<PracticePage learnerId={learnerId} />} />
            <Route path="/history/:problemId" element={<HistoryPage learnerId={learnerId} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
