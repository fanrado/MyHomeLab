import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GithubPage from './pages/GithubPage';
import AppsHardwarePage from './pages/AppsHardwarePage';
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
            <Route path="/apps-hardware" element={<AppsHardwarePage />} />
          </Routes>
        </div>
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} MyHomeLab</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
