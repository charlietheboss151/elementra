#!/usr/bin/env bash
set -euo pipefail

SSH_HOST="${ELEMENTRA_SSH_HOST:-elementra}"
REMOTE_SRC="${ELEMENTRA_REMOTE_SRC:-~/src/elementra}"
REMOTE_WEB="${ELEMENTRA_REMOTE_WEB:-~/public_html}"

echo "Deploying charlietheboss.com to ${SSH_HOST}..."

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
rsync -a --delete --exclude ".well-known" --exclude "cosmica" dist/ ${REMOTE_WEB}/
bash ${REMOTE_SRC}/scripts/start-account-server.sh
cp ${REMOTE_SRC}/deploy/nginx-elementra-api.conf \${HOME}/elementra-nginx-api.conf
if ! crontab -l 2>/dev/null | grep -q start-account-server.sh; then
  (crontab -l 2>/dev/null; echo "@reboot bash \$HOME/src/elementra/scripts/start-account-server.sh") | crontab -
fi
echo "Deployed commit: \$(git rev-parse --short HEAD)"
echo "Note: Cosmica deploys separately from ~/src/cosmica (see cosmica repo)."
echo "Note: nginx must proxy /api/ to 127.0.0.1:8788 (see ~/elementra-nginx-api.conf)."
EOF

echo "Live site: https://charlietheboss.com"
echo "Elementra: https://charlietheboss.com/elementra/"
echo "Cosmica:   https://charlietheboss.com/cosmica/"
