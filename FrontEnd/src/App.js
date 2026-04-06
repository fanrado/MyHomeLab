import React from 'react';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="hero">
        <h1 className="hero-title">MyHomeLab</h1>
        <p className="hero-subtitle">Personal home lab dashboard</p>

        <div className="card-grid">
          <div className="card">
            <h2>Services</h2>
            <p>Manage and monitor your running services.</p>
          </div>
          <div className="card">
            <h2>Network</h2>
            <p>Overview of your home network topology.</p>
          </div>
          <div className="card">
            <h2>Storage</h2>
            <p>Track disk usage across your lab nodes.</p>
          </div>
          <div className="card">
            <h2>Monitoring</h2>
            <p>Metrics, logs, and health checks at a glance.</p>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} MyHomeLab</p>
      </footer>
    </div>
  );
}

export default App;
