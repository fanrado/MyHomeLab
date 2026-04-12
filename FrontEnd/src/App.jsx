import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GithubPage from './pages/GithubPage';
import AppsPage from './pages/AppsPage';
import HardwarePage from './pages/HardwarePage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/github" element={<GithubPage />} />
            <Route path="/apps" element={<AppsPage />} />
            <Route path="/hardware" element={<HardwarePage />} />
          </Routes>
        </div>
        <footer className="footer">
          <p>&copy; {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()} MyHomeLab</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
