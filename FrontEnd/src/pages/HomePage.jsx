import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <main className="hero">
      <h1 className="hero-title">MyHomeLab</h1>
      <p className="hero-subtitle">Personal home lab dashboard</p>

      <div className="card-grid">
        <Link to="/overview" className="card">
          <h2>Overview</h2>
          <p>A visual overview of all running apps — pictures and short descriptions at a glance.</p>
        </Link>
        <Link to="/github" className="card">
          <h2>Github</h2>
          <p>Browse repositories and explore the file structure of any public GitHub account.</p>
        </Link>
        <Link to="/apps-hardware" className="card">
          <h2>Apps / Hardware</h2>
          <p>Manage installed applications and monitor hardware components across your lab.</p>
        </Link>
        <Link to="/dashboard" className="card">
          <h2>Dashboard</h2>
          <p>Metrics, logs, and health checks at a glance.</p>
        </Link>
      </div>
    </main>
  );
}

export default HomePage;
