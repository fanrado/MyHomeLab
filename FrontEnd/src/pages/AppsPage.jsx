import React, { useState } from 'react';
import './AppsHardwarePage.css';
import TodoApp from '../WebApps/TodoApp';

/* ── Placeholder data — replace with real entries over time ── */
const WEB_APPS = [
  {
    name: 'To-Do List',
    description: 'Manage tasks backed by a CSV file. Supports add, edit, delete, import & export.',
    key: 'todo',
    icon: '📋',
  },
];

/* ── Registry: app key → component ──────────────────────── */
const APP_COMPONENTS = {
  todo: TodoApp,
};

/* ── WebApp card ─────────────────────────────────────────── */
function WebAppCard({ app, onOpen }) {
  const inner = (
    <>
      <span className="ah-card-icon">{app.icon || '🌐'}</span>
      <div className="ah-card-body">
        <h3 className="ah-card-title">{app.name}</h3>
        {app.description && <p className="ah-card-desc">{app.description}</p>}
      </div>
    </>
  );

  if (app.key) {
    return <button className="ah-card" onClick={() => onOpen(app.key)}>{inner}</button>;
  }
  return (
    <a className="ah-card" href={app.url} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  );
}

/* ── Empty state ─────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="ah-empty">
      <span className="ah-empty-icon">📭</span>
      <p>No web apps yet — add entries in <code>AppsPage.jsx</code>.</p>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
function AppsPage() {
  const [openApp, setOpenApp] = useState(null);

  function closeInlineApp() {
    setOpenApp(null);
  }

  const OpenAppComponent = openApp ? APP_COMPONENTS[openApp] : null;

  return (
    <div className="ah-page">
      <header className="ah-header">
        <h1 className="ah-title">Web Apps</h1>
        <p className="ah-subtitle">Web applications running in the lab.</p>
      </header>

      <div className="ah-content">
        {OpenAppComponent ? (
          <OpenAppComponent onClose={closeInlineApp} />
        ) : (
          WEB_APPS.length > 0
            ? <div className="ah-grid">{WEB_APPS.map((a, i) => <WebAppCard key={i} app={a} onOpen={setOpenApp} />)}</div>
            : <EmptyState />
        )}
      </div>
    </div>
  );
}

export default AppsPage;
