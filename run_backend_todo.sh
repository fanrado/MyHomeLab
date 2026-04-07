#!/usr/bin/env bash
# run_backend_todo.sh — start the To-Do List Flask backend

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Activate the project virtual environment
source "$SCRIPT_DIR/myhomelab_env/bin/activate"

echo "Starting To-Do backend on http://localhost:5000 ..."
python -m BackEnd.todo.app
