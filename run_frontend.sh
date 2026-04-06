#!/usr/bin/env bash

# Guard against accidental sourcing — must be run as a subprocess
if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
  echo "ERROR: Do not source this script. Run it as: ./run_frontend.sh" >&2
  return 1
fi

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Activate the Python virtual environment (includes nodeenv Node.js)
source "$SCRIPT_DIR/myhomelab_env/bin/activate"

# Install npm dependencies if vite is missing
if [ ! -f "$SCRIPT_DIR/FrontEnd/node_modules/.bin/vite" ]; then
  echo "Dependencies not found — running npm install..."
  npm install --legacy-peer-deps --prefix "$SCRIPT_DIR/FrontEnd"
fi

echo "Starting React development server..."
npm start --prefix "$SCRIPT_DIR/FrontEnd"
