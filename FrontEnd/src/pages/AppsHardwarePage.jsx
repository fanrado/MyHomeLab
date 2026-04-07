import React, { useState } from 'react';
import './AppsHardwarePage.css';

/* ── Placeholder data — replace with real entries over time ── */
const WEB_APPS = [
  // { name: 'MyHomeLab', description: 'This dashboard.', url: 'http://localhost:3000', icon: '🏠' },
];

const HARDWARE_PROJECTS = [
  // { name: 'Raspberry Pi Cluster', description: '3-node k3s cluster.', status: 'Active', icon: '🖥️' },
];

/* ── WebApp card ─────────────────────────────────────────── */
function WebAppCard({ app }) {
  return (
    <a
      className="ah-card"
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="ah-card-icon">{app.icon || '🌐'}</span>
      <div className="ah-card-body">
        <h3 className="ah-card-title">{app.name}</h3>
        {app.description && <p className="ah-card-desc">{app.description}</p>}
        {app.url && <span className="ah-card-url">{app.url}</span>}
      </div>
    </a>
  );
}

/* ── Hardware card ───────────────────────────────────────── */
function HardwareCard({ project }) {
  return (
    <div className="ah-card">
      <span className="ah-card-icon">{project.icon || '🔧'}</span>
      <div className="ah-card-body">
        <h3 className="ah-card-title">{project.name}</h3>
        {project.description && <p className="ah-card-desc">{project.description}</p>}
        {project.status && (
          <span className={`ah-status ah-status--${project.status.toLowerCase()}`}>
            {project.status}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────── */
function EmptyState({ label }) {
  return (
    <div className="ah-empty">
      <span className="ah-empty-icon">📭</span>
      <p>No {label} yet — add entries in <code>AppsHardwarePage.jsx</code>.</p>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
function AppsHardwarePage() {
  const [tab, setTab] = useState('webapps');

  return (
    <div className="ah-page">
      <header className="ah-header">
        <h1 className="ah-title">Apps &amp; Hardware</h1>
        <p className="ah-subtitle">Web applications and hardware projects running in the lab.</p>
      </header>

      {/* ── Tabs ── */}
      <div className="ah-tabs">
        <button
          className={`ah-tab-btn ${tab === 'webapps' ? 'active' : ''}`}
          onClick={() => setTab('webapps')}
        >
          🌐 Web Apps
        </button>
        <button
          className={`ah-tab-btn ${tab === 'hardware' ? 'active' : ''}`}
          onClick={() => setTab('hardware')}
        >
          🔧 Hardware Projects
        </button>
      </div>

      {/* ── Tab content ── */}
      <div className="ah-content">
        {tab === 'webapps' && (
          WEB_APPS.length > 0
            ? <div className="ah-grid">{WEB_APPS.map((a, i) => <WebAppCard key={i} app={a} />)}</div>
            : <EmptyState label="web apps" />
        )}
        {tab === 'hardware' && (
          HARDWARE_PROJECTS.length > 0
            ? <div className="ah-grid">{HARDWARE_PROJECTS.map((p, i) => <HardwareCard key={i} project={p} />)}</div>
            : <EmptyState label="hardware projects" />
        )}
      </div>
    </div>
  );
}

export default AppsHardwarePage;
