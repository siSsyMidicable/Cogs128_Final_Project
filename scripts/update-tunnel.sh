#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# update-tunnel.sh
#
# Run this every time you start a new Expo tunnel and get a new URL.
#
# Usage:
#   chmod +x scripts/update-tunnel.sh   (first time only)
#   ./scripts/update-tunnel.sh exp://your-tunnel-url.trycloudflare.com
#
# Requires: jq  (sudo apt install jq)
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

TUNNEL_URL="${1:-}"

if [[ -z "$TUNNEL_URL" ]]; then
  echo "Usage: $0 <tunnel-url>"
  echo "  e.g. $0 exp://comedy-queries-lee-greetings.trycloudflare.com"
  exit 1
fi

# locate repo root (works from any subdirectory)
REPO_ROOT="$(git rev-parse --show-toplevel)"
JSON_FILE="$REPO_ROOT/tunnel-url.json"
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

# write the file
jq -n --arg url "$TUNNEL_URL" --arg ts "$TIMESTAMP" \
  '{url: $url, updated: $ts}' > "$JSON_FILE"

echo "✔ Wrote $JSON_FILE"
cat "$JSON_FILE"
echo ""

# commit + push
cd "$REPO_ROOT"
git add tunnel-url.json
git commit -m "chore(tunnel): update URL $TIMESTAMP"
git push origin main

echo ""
echo "✔ Pushed. QR on profile screen will refresh within 30 seconds."
