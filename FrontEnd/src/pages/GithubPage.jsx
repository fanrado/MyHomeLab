import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './GithubPage.css';

/* ── Cache helpers (localStorage, 30-min TTL) ──────────── */
const CACHE_TTL = 10 * 60 * 1000;

function cacheGet(url) {
  try {
    const raw = localStorage.getItem(`gh:${url}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(`gh:${url}`); return null; }
    return data;
  } catch { return null; }
}

function cacheSet(url, data) {
  try { localStorage.setItem(`gh:${url}`, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

function cacheInvalidate(url) {
  try { localStorage.removeItem(`gh:${url}`); } catch {}
}

// Checks cache first; fetches from API and caches on miss; throws on HTTP error
async function ghFetch(url, { asText = false } = {}) {
  const cached = cacheGet(url);
  if (cached !== null) return cached;
  const res = await fetch(url);
  if (!res.ok) { const err = new Error(res.statusText); err.status = res.status; throw err; }
  const data = asText ? await res.text() : await res.json();
  cacheSet(url, data);
  return data;
}

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
        const data = await ghFetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}`
        );
        setChildren(
          Array.isArray(data)
            ? [...data].sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'dir' ? -1 : 1;
              })
            : []
        );
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
  const [defaultBranch, setDefaultBranch] = useState('main');

  useEffect(() => {
    setReadme(null);
    setTree(null);
    setReadmeLoading(true);
    setTreeLoading(true);

    // Fetch default branch (cached)
    ghFetch(`https://api.github.com/repos/${owner}/${repo.name}`)
      .then(data => { if (data?.default_branch) setDefaultBranch(data.default_branch); })
      .catch(() => {});

    // Fetch README: API gives download_url, then fetch raw text (both cached)
    ghFetch(`https://api.github.com/repos/${owner}/${repo.name}/readme`)
      .then(data => data?.download_url ? ghFetch(data.download_url, { asText: true }) : null)
      .then(text => { setReadme(text); setReadmeLoading(false); })
      .catch(() => setReadmeLoading(false));

    // Fetch root file tree (cached)
    ghFetch(`https://api.github.com/repos/${owner}/${repo.name}/contents/`)
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

  // Resolve relative URLs to raw.githubusercontent.com
  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo.name}/${defaultBranch}`;

  const resolveUrl = (src) => {
    if (!src) return src;
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
    return `${rawBase}/${src.replace(/^\.?\//, '')}`;
  };

  const mdComponents = {
    img: ({ src, alt, ...props }) => (
      <img src={resolveUrl(src)} alt={alt} {...props} style={{ maxWidth: '100%', borderRadius: '6px' }} />
    ),
    video: ({ src, children, ...props }) => (
      <video
        src={resolveUrl(src)}
        controls
        style={{ maxWidth: '100%', borderRadius: '6px' }}
        {...props}
      >
        {children}
      </video>
    ),
    source: ({ src, ...props }) => (
      <source src={resolveUrl(src)} {...props} />
    ),
  };

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
              ? <ReactMarkdown className="readme-md" remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={mdComponents}>{readme}</ReactMarkdown>
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
  const [profile, setProfile] = useState(null);
  const [username] = useState('fanrado');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRepo, setSelectedRepo] = useState(null);

  const fetchRepos = async (user) => {
    if (!user) return;
    setLoading(true);
    setError('');
    setRepos([]);
    setSelectedRepo(null);
    try {
      const data = await ghFetch(
        `https://api.github.com/users/${user}/repos?per_page=100&sort=updated`
      );
      setRepos(data);
    } catch (err) {
      if (err.status === 404) setError(`User "${user}" not found.`);
      else if (err.status === 403) setError('GitHub API rate limit reached. Please try again later.');
      else setError('Network error. Please check your connection.');
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial load — served from cache if available, otherwise fetches from API
    ghFetch('https://api.github.com/users/fanrado')
      .then(data => setProfile(data))
      .catch(() => {});
    fetchRepos('fanrado');

    // Background refresh every 30 minutes — silently updates without resetting UI
    const timer = setInterval(() => {
      cacheInvalidate('https://api.github.com/users/fanrado');
      cacheInvalidate('https://api.github.com/users/fanrado/repos?per_page=100&sort=updated');
      ghFetch('https://api.github.com/users/fanrado')
        .then(data => setProfile(data))
        .catch(() => {});
      ghFetch('https://api.github.com/users/fanrado/repos?per_page=100&sort=updated')
        .then(data => setRepos(data))
        .catch(() => {});
    }, CACHE_TTL);

    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="github-page">
      {/* ── Sidebar ── */}
      <aside className="github-sidebar">
        <div className="github-profile-box">
          {profile ? (
            <>
              <img className="github-avatar" src={profile.avatar_url} alt={profile.login} />
              <div className="github-profile-info">
                <span className="github-profile-name">{profile.name || profile.login}</span>
                <span className="github-profile-login">@{profile.login}</span>
                {profile.bio && <span className="github-profile-bio">{profile.bio}</span>}
              </div>
            </>
          ) : (
            <span className="github-profile-login">@fanrado</span>
          )}
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
              {loading
              ? 'Loading repositories…'
              : 'Select a repository to view its README and file structure.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default GithubPage;
