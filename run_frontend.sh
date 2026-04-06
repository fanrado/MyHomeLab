#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Activate the Python virtual environment (includes nodeenv Node.js)
source "$SCRIPT_DIR/myhomelab_env/bin/activate"

# Install npm dependencies if node_modules is missing
if [ ! -d "$SCRIPT_DIR/FrontEnd/node_modules" ]; then
  echo "node_modules not found — running npm install..."
  npm install --prefix "$SCRIPT_DIR/FrontEnd"
fi

echo "Starting React development server..."
npm start --prefix "$SCRIPT_DIR/FrontEnd"
