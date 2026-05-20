#!/usr/bin/env bash
# Local development launcher for the Maisha Chat frontend (Vite dev server).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ ! -d node_modules ]]; then
  echo "[start.sh] Installing dependencies..."
  npm install
fi

# Where the Vite dev server proxies /api/* to. Defaults to the local Django.
export VITE_API_PROXY_TARGET="${VITE_API_PROXY_TARGET:-http://127.0.0.1:8090}"

# VITE_API_BASE_URL is intentionally empty so the SPA uses same-origin requests
# (browser -> Vite -> Django). Override only if the SPA must talk to a
# different origin (e.g. cross-origin staging).
export VITE_API_BASE_URL="${VITE_API_BASE_URL:-}"

PORT="${PORT:-3090}"
HOST="${HOST:-0.0.0.0}"

if command -v lsof >/dev/null 2>&1; then
  EXISTING_PID="$(lsof -t -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | head -n1 || true)"
  if [[ -n "$EXISTING_PID" ]]; then
    echo "[start.sh] Port ${PORT} is already in use (PID ${EXISTING_PID})."
    echo "[start.sh] Dev server may already be running: http://127.0.0.1:${PORT}"
    echo "[start.sh] To restart, stop it first: kill ${EXISTING_PID}"
    exit 1
  fi
fi

echo "[start.sh] Starting Vite dev server on ${HOST}:${PORT}"
echo "[start.sh] Proxying /api/* -> $VITE_API_PROXY_TARGET"
if [[ -n "$VITE_API_BASE_URL" ]]; then
  echo "[start.sh] (Overriding base URL: $VITE_API_BASE_URL)"
fi
exec npm run dev -- --host "$HOST" --port "$PORT"
