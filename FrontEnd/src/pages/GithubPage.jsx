import React, { useState, useEffect } from 'react';
import './GithubPage.css';

/* ── Recursive file tree node ────────────────────────────── */
function TreeNode({ owner, repo, item }) {
  const [children, setChildren] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (item.type !== 'dir') return;
    if (!open && children === null) {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}`
        );
        if (res.ok) {
          const data = await res.json();
          setChildren(
            Array.isArray(data)
              ? [...data].sort((a, b) => {
                  if (a.type === b.type) return a.name.localeCompare(b.name);
                  return a.type === 'dir' ? -1 : 1;
                })
              : []
          );
        }
      } catch {
        setChildren([]);
      }
      setLoading(false);
    }
    setOpen(o => !o);
  };

  const icon = item.type === 'dir' ? (open ? '📂' : '📁') : '📄';

  return (
    <li className="tree-node">
      <span
        className={`tree-label ${item.type === 'dir' ? 'tree-dir' : 'tree-file'}`}
        onClick={toggle}
        role={item.type === 'dir' ? 'button' : undefined}
      >
        <span className="tree-icon">{icon}</span>
        <span className="tree-name">{item.name}</span>
        {loading && <span className="tree-spinner">…</span>}
      </span>
      {open && children && children.length > 0 && (
        <ul className="tree-children">
          {children.map(child => (
            <TreeNode key={child.sha} owner={owner} repo={repo} item={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ── Repo detail panel ───────────────────────────────────── */
function RepoPanel({ owner, repo, onClose }) {
  const [readme, setReadme] = useState(null);
  const [readmeLoading, setReadmeLoading] = useState(true);
  const [tree, setTree] = useState(null);
  const [treeLoading, setTreeLoading] = useState(true);
  const [tab, setTab] = useState('readme');

  useEffect(() => {
    setReadme(null);
    setTree(null);
    setReadmeLoading(true);
    setTreeLoading(true);

    // Fetch README raw text via download_url
    fetch(`https://api.github.com/repos/${owner}/${repo.name}/readme`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => (data?.download_url ? fetch(data.download_url).then(r => r.text()) : null))
      .then(text => { setReadme(text); setReadmeLoading(false); })
      .catch(() => setReadmeLoading(false));

    // Fetch root file tree
    fetch(`https://api.github.com/repos/${owner}/${repo.name}/contents/`)
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        const sorted = Array.isArray(data)
          ? [...data].sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === 'dir' ? -1 : 1;
            })
          : [];
        setTree(sorted);
        setTreeLoading(false);
      })
      .catch(() => { setTree([]); setTreeLoading(false); });
  }, [owner, repo.name]);

  return (
    <div className="repo-panel">
      <div className="repo-panel-header">
        <div className="repo-panel-title">
          <h2>{repo.name}</h2>
          {repo.description && <p className="repo-panel-desc">{repo.description}</p>}
          <div className="repo-panel-meta">
            {repo.language && <span className="meta-tag">{repo.language}</span>}
            <span className="meta-tag">⭐ {repo.stargazers_count}</span>
            <span className="meta-tag">🍴 {repo.forks_count}</span>
            {repo.license && <span className="meta-tag">{repo.license.spdx_id}</span>}
            <span className="meta-tag">
              Updated {new Date(repo.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button className="panel-close" onClick={onClose} aria-label="Close panel">✕</button>
      </div>

      <div className="repo-tabs">
        <button
          className={`tab-btn ${tab === 'readme' ? 'active' : ''}`}
          onClick={() => setTab('readme')}
        >
          README
        </button>
        <button
          className={`tab-btn ${tab === 'files' ? 'active' : ''}`}
          onClick={() => setTab('files')}
        >
          Files
        </button>
      </div>

      <div className="repo-panel-body">
        {tab === 'readme' && (
          readmeLoading
            ? <div className="panel-loading">Loading README…</div>
            : readme
              ? <pre className="readme-pre">{readme}</pre>
              : <p className="panel-empty">No README found for this repository.</p>
        )}
        {tab === 'files' && (
          treeLoading
            ? <div className="panel-loading">Loading files…</div>
            : tree && tree.length > 0
              ? (
                <ul className="tree-root">
                  {tree.map(item => (
                    <TreeNode key={item.sha} owner={owner} repo={repo.name} item={item} />
                  ))}
                </ul>
              )
              : <p className="panel-empty">This repository is empty.</p>
        )}
      </div>
    </div>
  );
}

/* ── Main GitHub page ────────────────────────────────────── */
function GithubPage() {
  const [inputValue, setInputValue] = useState('');
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRepo, setSelectedRepo] = useState(null);

  const handleSearch = async e => {
    e.preventDefault();
    const user = inputValue.trim();
    if (!user) return;
    setLoading(true);
    setError('');
    setRepos([]);
    setSelectedRepo(null);
    try {
      const res = await fetch(
        `https://api.github.com/users/${user}/repos?per_page=100&sort=updated`
      );
      if (res.status === 404) {
        setError(`User "${user}" not found.`);
      } else if (res.status === 403) {
        setError('GitHub API rate limit reached. Please try again later.');
      } else if (!res.ok) {
        setError('Failed to fetch repositories.');
      } else {
        const data = await res.json();
        setUsername(user);
        setRepos(data);
      }
    } catch {
      setError('Network error. Please check your connection.');
    }
    setLoading(false);
  };

  return (
    <div className="github-page">
      {/* ── Sidebar ── */}
      <aside className="github-sidebar">
        <div className="github-search-box">
          <h2 className="github-search-title">GitHub Repositories</h2>
          <form onSubmit={handleSearch} className="github-form">
            <input
              type="text"
              className="github-input"
              placeholder="Enter GitHub username…"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              autoComplete="off"
              spellCheck="false"
            />
            <button type="submit" className="github-search-btn" disabled={loading}>
              {loading ? '…' : 'Search'}
            </button>
          </form>
          {error && <p className="github-error">{error}</p>}
        </div>

        {repos.length > 0 && (
          <div className="repo-list">
            <p className="repo-count">
              <strong>{repos.length}</strong> public repos for <em>{username}</em>
            </p>
            {repos.map(repo => (
              <button
                key={repo.id}
                className={`repo-item ${selectedRepo?.id === repo.id ? 'selected' : ''}`}
                onClick={() => setSelectedRepo(repo)}
              >
                <span className="repo-item-name">{repo.name}</span>
                {repo.description && (
                  <span className="repo-item-desc">{repo.description}</span>
                )}
                <div className="repo-item-meta">
                  {repo.language && (
                    <span className="repo-item-lang">{repo.language}</span>
                  )}
                  <span>⭐ {repo.stargazers_count}</span>
                  <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* ── Detail panel ── */}
      <section className="github-main">
        {selectedRepo ? (
          <RepoPanel
            owner={username}
            repo={selectedRepo}
            onClose={() => setSelectedRepo(null)}
          />
        ) : (
          <div className="github-welcome">
            <div className="github-welcome-icon">🐙</div>
            <p>
              {repos.length > 0
                ? 'Select a repository to view its README and file structure.'
                : 'Enter a GitHub username to browse their public repositories.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default GithubPage;
