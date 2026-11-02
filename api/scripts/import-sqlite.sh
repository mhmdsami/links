#!/usr/bin/env bash
set -euo pipefail

# One-time import of the old SQLite database into D1.
# Usage: ./scripts/import-sqlite.sh [source.sqlite] [database-name]

SRC="${1:-db.sqlite}"
DATABASE="${2:-links-db}"

if [[ ! -f "$SRC" ]]; then
  echo "Source database not found: $SRC" >&2
  exit 1
fi

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

for table in user link session account verification; do
  if [[ -n "$(sqlite3 "$SRC" "SELECT name FROM sqlite_master WHERE type='table' AND name='$table';")" ]]; then
    sqlite3 "$SRC" ".mode insert $table" "SELECT * FROM $table;" >> "$TMP"
  fi
done

if [[ ! -s "$TMP" ]]; then
  echo "No rows to import from $SRC."
  exit 0
fi

echo "Importing $(grep -c '^INSERT' "$TMP") rows from $SRC into $DATABASE..."
npx --yes wrangler@4.156.0 d1 execute "$DATABASE" --remote --file="$TMP"
