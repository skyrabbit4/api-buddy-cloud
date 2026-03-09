#!/bin/bash
set -e

cd /Users/shubhamkaushik/Projects/api-buddy-cloud

echo "=== BRANCH ==="
git branch --show-current

echo "=== STAGING ALL ==="
git add -A

echo "=== STATUS ==="
git status --short | head -40

echo "=== COMMITTING ==="
git commit -m "feat: complete Angular 20 migration with OAuth, profile menu

- Full Angular 20 migration from React/Vite
- Google & GitHub OAuth with Supabase
- Profile menu with avatar dropdown
- Auth guard for protected routes
- Dashboard with mock endpoint CRUD
- Landing page with responsive design
- Tailwind CSS dark theme" 2>&1

echo "=== PUSHING ==="
git push origin angular-migration 2>&1

echo "=== DONE ==="
echo "Push complete!"
