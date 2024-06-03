// src/components/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import '../styles/App.css';
import LandingPage from './LandingPage';
import HealingItemsPage from './HealingItemsPage';
import Navigation from './Navigation';
import Game from './Game';

const App = () => {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <Link to="/" className="app-title-link">
            <h1 className="app-title">Fortnite Math</h1>
          </Link>
          <Navigation />
        </header>
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route path="/healing-items" element={<HealingItemsPage />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;