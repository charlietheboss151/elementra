#!/usr/bin/env bash
set -euo pipefail

KEY_PATH="${HOME}/.ssh/elementra_ed25519"
CONFIG_PATH="${HOME}/.ssh/config"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "${HOME}/.ssh"
chmod 700 "${HOME}/.ssh"

if [[ ! -f "${KEY_PATH}" ]]; then
  echo "Creating Elementra deploy key at ${KEY_PATH}"
  ssh-keygen -t ed25519 -f "${KEY_PATH}" -C "elementra-deploy" -N ""
else
  echo "Deploy key already exists: ${KEY_PATH}"
fi

chmod 600 "${KEY_PATH}"
chmod 644 "${KEY_PATH}.pub"

if ! grep -q '^Host elementra$' "${CONFIG_PATH}" 2>/dev/null; then
  echo "Adding Host elementra to ${CONFIG_PATH}"
  mkdir -p "$(dirname "${CONFIG_PATH}")"
  touch "${CONFIG_PATH}"
  chmod 600 "${CONFIG_PATH}"
  cat >> "${CONFIG_PATH}" <<'EOF'

Host elementra
  HostName 192.64.87.248
  User charlie
  IdentityFile ~/.ssh/elementra_ed25519
  IdentitiesOnly yes
EOF
else
  echo "SSH config already has Host elementra"
fi

echo
echo "Public key (add this line to ~/.ssh/authorized_keys on the server):"
echo
cat "${KEY_PATH}.pub"
echo
echo "One-liner from a machine that already has password/other-key access:"
echo "  ssh charlie@192.64.87.248 'mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys' < ${KEY_PATH}.pub"
echo
echo "Test: ssh elementra 'echo ok && hostname'"
echo "Deploy: ${REPO_ROOT}/scripts/deploy.sh"
