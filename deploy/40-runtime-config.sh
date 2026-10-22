#!/bin/sh
set -eu
API_URL=${API_URL:-http://localhost:8000}
case "$API_URL" in
  *[!a-zA-Z0-9.:/-]*) echo 'API_URL must be an HTTP(S) origin without path or trailing slash' >&2; exit 1 ;;
esac
# Only origins with DNS/IPv4 hosts and optional ports; no JavaScript metacharacters.
if ! printf '%s' "$API_URL" | grep -Eq '^https?://[a-zA-Z0-9][a-zA-Z0-9.-]*(:[0-9]{1,5})?$'; then
  echo 'API_URL must be an HTTP(S) origin without path or trailing slash' >&2
  exit 1
fi
printf 'window.__SILVERBOX_CONFIG__ = {"apiUrl":"%s"};\n' "$API_URL" > /usr/share/nginx/html/runtime-config.js
