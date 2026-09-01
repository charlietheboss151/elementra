#!/usr/bin/env bash
# Run as root on the web server (henry or sudo):
#   sudo bash /home/charlie/src/elementra/scripts/install-elementra-api-nginx.sh
set -euo pipefail

SNIPPET_SRC="/home/charlie/src/elementra/deploy/nginx-elementra-api.conf"
SNIPPET_DST="/etc/nginx/snippets/elementra-api.conf"
VHOST="/home/henry/webserver/nginx/conf.d/00-charlietheboss.com.conf"
MARKER="snippets/elementra-api.conf"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo bash $0" >&2
  exit 1
fi

cp "${SNIPPET_SRC}" "${SNIPPET_DST}"

if grep -q "${MARKER}" "${VHOST}"; then
  echo "Already included in ${VHOST}"
else
  python3 - "${VHOST}" <<'PY'
from pathlib import Path
import sys
path = Path(sys.argv[1])
text = path.read_text()
include = "    include snippets/elementra-api.conf;\n"
# Insert before the last closing brace of the file (end of last server block).
idx = text.rfind("}")
if idx == -1:
    raise SystemExit("Could not find a closing brace in the vhost file.")
path.write_text(text[:idx] + include + text[idx:])
print(f"Inserted include into {path}")
PY
fi

nginx -t
systemctl reload nginx
echo "Elementra /api/ now proxies to 127.0.0.1:8788"
