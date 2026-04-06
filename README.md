# MyHomeLab

A full-stack home lab dashboard with a Python backend (FastAPI / Flask) and a React + Vite frontend.

---

## Features

- **Home page** — dark-themed card grid linking to all sections; cards animate on hover with a light-blue glow effect
- **GitHub page** — displays the `fanrado` GitHub profile (avatar, name, bio) and all public repositories; click any repo to view its README (with full markdown rendering, images, and videos) and explore the file tree
- **Navbar** — sticky top bar with live clock and active-link highlighting; nav links scale and glow on hover
- **Caching** — GitHub API responses are cached in `localStorage` (10-minute TTL); data is served from cache on repeat visits and silently refreshed in the background every 10 minutes

---

## Prerequisites

- **Python** 3.11+

Node.js and npm are managed inside the Python virtual environment via `nodeenv` — no system-level Node.js installation is required.

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd MyHomeLab
```

### 2. Create and activate a virtual environment

```bash
python3 -m venv myhomelab_env
source myhomelab_env/bin/activate   # Windows: myhomelab_env\Scripts\activate
```

### 3. Install all dependencies (Python + Node.js + React)

```bash
# Install Python packages (FastAPI, Flask, nodeenv, uvicorn)
pip install -e .

# Embed Node.js into the active Python virtual environment
nodeenv --python-virtualenv

# Install React frontend dependencies
npm install --prefix FrontEnd
```

After this, `node`, `npm`, and all Python tools are available within the same activated virtualenv.

To also install development dependencies (pytest, httpx):

```bash
pip install -e ".[dev]"
```

---

## Running the Project

### Frontend (quick start)

A convenience script handles activation and startup automatically:

```bash
./run_frontend.sh
```

The React dev server will be available at `http://localhost:3000`.

### Frontend (manual)

```bash
source myhomelab_env/bin/activate
npm start --prefix FrontEnd
```

### Backend

```bash
source myhomelab_env/bin/activate

# FastAPI
uvicorn BackEnd.main:app --reload

# or Flask
flask --app BackEnd/app.py run --debug
```

The FastAPI server runs on `http://localhost:8000` by default.

---

## Project Structure

```
MyHomeLab/
├── BackEnd/                    # Python backend (FastAPI / Flask)
├── FrontEnd/                   # React + Vite frontend
│   ├── index.html              # Vite HTML entry point
│   ├── vite.config.js          # Vite configuration (port 3000)
│   ├── package.json            # Node.js dependencies
│   └── src/
│       ├── index.jsx           # React root mount
│       ├── App.jsx             # Router + layout (Navbar, Routes, Footer)
│       ├── App.css             # Global dark theme styles
│       ├── components/
│       │   └── Navbar.jsx      # Sticky navbar with live clock
│       └── pages/
│           ├── HomePage.jsx    # Card grid home page
│           ├── GithubPage.jsx  # GitHub profile + repo browser (with cache)
│           └── GithubPage.css  # GitHub page styles
├── myhomelab_env/              # Python virtualenv (not committed)
├── pyproject.toml              # Python project & dependency definition
├── run_frontend.sh             # Convenience script to start the frontend
└── README.md
```

---

## GitHub API Caching

All GitHub API calls go through a `localStorage`-backed cache:

- **First visit** — data is fetched from the GitHub API and stored in `localStorage`
- **Subsequent visits** — data is served from cache instantly (no network request)
- **TTL** — cache entries expire after **10 minutes**; expired entries are re-fetched transparently
- **Auto-refresh** — while the page is open, a background timer invalidates and refreshes the profile and repo list every 10 minutes

> GitHub's unauthenticated API limit is **60 requests/hour** per IP. The cache keeps usage well within that limit during normal browsing.

