#!/usr/bin/env bash
# Re-sync jobs from labor-market-radar and redeploy the site from a clean clone.
# Env: DEPLOY_DIR, REPO_URL, REF, DEPLOY_CMD, PUSH (0 disables push)
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-$HOME/prj/.deploy/dr-portfolio}"
REPO_URL="${REPO_URL:-https://github.com/dan-rozhkov/dr-portfolio.git}"
REF="${REF-origin/main}"
DEPLOY_CMD="${DEPLOY_CMD:-npm run deploy}"
PUSH="${PUSH:-1}"

if [ ! -d "$DEPLOY_DIR/.git" ]; then
  mkdir -p "$(dirname "$DEPLOY_DIR")"
  git clone "$REPO_URL" "$DEPLOY_DIR"
fi
cd "$DEPLOY_DIR"

git fetch origin
if [ -n "$REF" ]; then
  git reset --hard "$REF"
else
  git reset --hard origin/main
fi
git clean -fdx -e node_modules

npm ci
npm run sync:jobs
npm test
npm run build
bash -c "$DEPLOY_CMD"

if [ -n "$(git status --porcelain src/data/jobs.json)" ]; then
  git add src/data/jobs.json
  git commit -m "chore: sync jobs [radar]"
  if [ "$PUSH" = "1" ]; then
    git push origin main
  else
    echo "PUSH=0: skipping push"
  fi
fi
