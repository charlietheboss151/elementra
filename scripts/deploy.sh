#!/usr/bin/env bash
set -euo pipefail

SSH_HOST="${ELEMENTRA_SSH_HOST:-elementra}"
REMOTE_SRC="${ELEMENTRA_REMOTE_SRC:-~/src/elementra}"
REMOTE_WEB="${ELEMENTRA_REMOTE_WEB:-~/public_html}"

echo "Deploying Elementra to ${SSH_HOST}..."

ssh "${SSH_HOST}" bash -s <<EOF
set -euo pipefail
export NVM_DIR="\${HOME}/.nvm"
# shellcheck disable=SC1091
[ -s "\${NVM_DIR}/nvm.sh" ] && . "\${NVM_DIR}/nvm.sh"
nvm use 20 >/dev/null

cd ${REMOTE_SRC}
git pull --ff-only origin main
npm ci
npm run build
rsync -a --delete --exclude ".well-known" dist/ ${REMOTE_WEB}/
echo "Deployed commit: \$(git rev-parse --short HEAD)"
EOF

echo "Live site: https://charlietheboss.com"
