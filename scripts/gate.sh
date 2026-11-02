#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Bun is required for the API gate. Override the binary, e.g.
#   BUN_BIN="npx --yes bun@1.2.21" npm run gate
if [[ -n "${BUN_BIN:-}" ]]; then
  read -r -a BUN <<< "$BUN_BIN"
else
  BUN=(bun)
fi

echo "==> api"
(cd "$ROOT/api" && "${BUN[@]}" run gate)

echo "==> web"
(cd "$ROOT/web" && "${BUN[@]}" run gate)

echo "==> app"
(cd "$ROOT/app" && "${BUN[@]}" run gate)
