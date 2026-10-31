#!/usr/bin/env bash
# Re-sync jobs from labor-market-radar and redeploy the site from a clean clone.
# Env: DEPLOY_DIR, REPO_URL, REF, DEPLOY_CMD, PUSH (0 disables push)
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-$HOME/prj/.deploy/dr-portfolio}"
REPO_URL="${REPO_URL:-https://github.com/dan-rozhkov/dr-portfolio.git}"
REF="${REF:-}"
DEPLOY_CMD="${DEPLOY_CMD:-npm run deploy}"
PUSH="${PUSH:-1}"

if [ ! -d "$DEPLOY_DIR/.git" ]; then
  mkdir -p "$(dirname "$DEPLOY_DIR")"
  git clone "$REPO_URL" "$DEPLOY_DIR"
  : > "$DEPLOY_DIR/.git/deploy-clone"
fi
cd "$DEPLOY_DIR"
# Marker lives in .git so `git clean` cannot remove it; protects real working copies.
if [ ! -f .git/deploy-clone ]; then
  echo "Refusing to reset/clean $DEPLOY_DIR: no .git/deploy-clone marker (not a deploy clone)" >&2
  exit 1
fi

git rebase --abort 2>/dev/null || true
git fetch origin
git reset --hard "${REF:-origin/main}"
git clean -fdx

npm ci
npm run sync:jobs
npm test
npm run build
bash -c "$DEPLOY_CMD"

if [ -n "$(git status --porcelain src/data/jobs.json)" ]; then
  git add src/data/jobs.json
  git commit -m "chore: sync jobs [radar]" -- src/data/jobs.json
  if [ "${REF:-origin/main}" != "origin/main" ]; then
    echo "REF is not origin/main: skipping push"
  elif [ "$PUSH" = "1" ]; then
    if ! git push origin main; then
      if ! git pull --rebase origin main; then
        git rebase --abort 2>/dev/null || true
        echo "DEPLOYED, BUT PUSH FAILED: jobs.json commit is local only and will be lost on the next run" >&2
        exit 1
      fi
      if ! git push origin main; then
        echo "DEPLOYED, BUT PUSH FAILED: jobs.json commit is local only and will be lost on the next run" >&2
        exit 1
      fi
    fi
  else
    echo "PUSH=0: skipping push"
  fi
fi
