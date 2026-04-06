# MyHomeLab

A full-stack home lab project with a Python backend (FastAPI / Flask) and a React frontend.

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
# Install Python packages (FastAPI, Flask) and nodeenv
pip install -e .

# Embed Node.js into the active Python virtual environment
nodeenv --python-virtualenv

# Install React frontend dependencies
npm install --prefix FrontEnd
```

After this, `node`, `npm`, and all Python tools are all available within the same activated virtualenv.

To also install development dependencies (pytest, httpx):

```bash
pip install -e ".[dev]"
```

---

## Running the Project

### Backend

```bash
# FastAPI (from workspace root, venv active)
uvicorn BackEnd.main:app --reload

# or Flask
flask --app BackEnd/app.py run --debug
```

### Frontend

```bash
cd FrontEnd
npm start
```

The React dev server runs on `http://localhost:3000` and the FastAPI server on `http://localhost:8000` by default.

---

## Project Structure

```
MyHomeLab/
├── BackEnd/          # Python backend (FastAPI / Flask)
├── FrontEnd/         # React frontend
│   └── package.json
├── pyproject.toml    # Python project & dependency definition
└── README.md
```
