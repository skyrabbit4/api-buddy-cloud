#!/bin/bash
set -e

BRANCH=$(git branch --show-current)

echo "=== BRANCH ==="
echo "$BRANCH"

echo "=== STAGING ALL ==="
git add -A

echo "=== STATUS ==="
git status --short | head -40

echo "=== COMMITTING ==="
git commit -m "${1:-update}" 2>&1

echo "=== PUSHING ==="
git push origin "$BRANCH" 2>&1

echo "=== DONE ==="
echo "Push complete!"
