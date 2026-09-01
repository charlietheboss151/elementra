#!/usr/bin/env bash
set -euo pipefail

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
[ -s "${NVM_DIR}/nvm.sh" ] && . "${NVM_DIR}/nvm.sh"
nvm use 20 >/dev/null

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="${HOME}/elementra-account-server.pid"
LOG_FILE="${HOME}/elementra-account-server.log"

if [[ -f "${PID_FILE}" ]]; then
  old="$(cat "${PID_FILE}" || true)"
  if [[ -n "${old}" ]] && kill -0 "${old}" 2>/dev/null; then
    kill "${old}" || true
    sleep 0.3
  fi
fi

nohup node "${ROOT}/server/account-server.mjs" >> "${LOG_FILE}" 2>&1 &
echo $! > "${PID_FILE}"
sleep 0.4
if ! kill -0 "$(cat "${PID_FILE}")" 2>/dev/null; then
  echo "Account server failed to start. See ${LOG_FILE}" >&2
  exit 1
fi
echo "Account server pid $(cat "${PID_FILE}")"
