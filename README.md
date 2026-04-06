# MyHomeLab

A full-stack home lab dashboard with a Python backend (FastAPI / Flask) and a React frontend.

---

## Prerequisites

- **Python** 3.11+

Node.js and npm are managed inside the Python virtual environment via `nodeenv` — no system-level Node.js installation required.

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

### 3. Install all dependencies (Python + Node.js + React) via pip

```bash
# Install Python packages (FastAPI, Flask, nodeenv)
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
├── FrontEnd/                   # React frontend
│   ├── public/
│   │   └── index.html          # HTML shell
│   ├── src/
│   │   ├── index.js            # React root mount
│   │   ├── App.js              # Homepage component
│   │   ├── App.css             # Dark theme styles
│   │   └── components/
│   │       └── Navbar.jsx      # Top navigation bar
│   └── package.json            # Node.js dependencies
├── myhomelab_env/              # Python virtualenv (not committed)
├── pyproject.toml              # Python project & dependency definition
├── run_frontend.sh             # Convenience script to start the frontend
└── README.md
```
