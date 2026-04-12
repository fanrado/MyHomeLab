import React from 'react';
import './AppsHardwarePage.css';

/* ── Placeholder data — replace with real entries over time ── */
const HARDWARE_PROJECTS = [
  // { name: 'Raspberry Pi Cluster', description: '3-node k3s cluster.', status: 'Active', icon: '🖥️' },
];

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
function EmptyState() {
  return (
    <div className="ah-empty">
      <span className="ah-empty-icon">📭</span>
      <p>No hardware projects yet — add entries in <code>HardwarePage.jsx</code>.</p>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
function HardwarePage() {
  return (
    <div className="ah-page">
      <header className="ah-header">
        <h1 className="ah-title">Hardware Projects</h1>
        <p className="ah-subtitle">Hardware projects running in the lab.</p>
      </header>

      <div className="ah-content">
        {HARDWARE_PROJECTS.length > 0
          ? <div className="ah-grid">{HARDWARE_PROJECTS.map((p, i) => <HardwareCard key={i} project={p} />)}</div>
          : <EmptyState />
        }
      </div>
    </div>
  );
}

export default HardwarePage;
