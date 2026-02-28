#!/bin/bash

# ──────────────────────────────────────
#  🏠 Biblion — Quick Launcher
# ──────────────────────────────────────

cd "$(dirname "$0")"

echo ""
echo "  📚 Starting Biblion..."
echo "  → http://localhost:3000"
echo ""

# Start the dev server in the background
npm run dev &
SERVER_PID=$!

# Wait for the server to be ready, then open the browser
(
  while ! curl -s http://localhost:3000 > /dev/null 2>&1; do
    sleep 1
  done
  open http://localhost:3000
) &

# Keep the script alive so the terminal stays open
wait $SERVER_PID
