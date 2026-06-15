#!/usr/bin/env bash
# Production deploy script for the Maisha Chat frontend (PM2 + serve).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ -f .env.production ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.production
  set +a
fi

export VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://api.maishachat.or.tz}"

echo "[deploy.sh] Installing dependencies (npm ci)..."
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "[deploy.sh] Building static bundle with VITE_API_BASE_URL=$VITE_API_BASE_URL"
npm run build

if [[ ! -f dist/index.html ]]; then
  echo "[deploy.sh] Build failed: dist/index.html missing" >&2
  exit 1
fi

JS_BUNDLE="$(grep -oE '/assets/index-[^"]+\.js' dist/index.html | head -1 || true)"
if [[ -n "$JS_BUNDLE" && ! -f "dist${JS_BUNDLE}" ]]; then
  echo "[deploy.sh] Build failed: missing bundle dist${JS_BUNDLE}" >&2
  exit 1
fi

echo "[deploy.sh] (Re)starting PM2 process..."
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

echo "[deploy.sh] Done. Frontend is live on 127.0.0.1:3090 -> https://maishachat.or.tz"
