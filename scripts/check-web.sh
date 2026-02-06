#!/usr/bin/env bash
# Ověří, že http://localhost:3000 vrací HTTP 200. Pro použití po spuštění kontejneru (docker compose up).
# Použití: ./scripts/check-web.sh   nebo  npm run check:web

set -e

URL="${1:-http://localhost:3000}"
MAX_ATTEMPTS="${CHECK_WEB_MAX_ATTEMPTS:-12}"
SLEEP="${CHECK_WEB_SLEEP:-5}"

for i in $(seq 1 "$MAX_ATTEMPTS"); do
  if code=$(curl -sL -o /dev/null -w "%{http_code}" --connect-timeout 3 "$URL" 2>/dev/null); then
    if [ "$code" = "200" ]; then
      echo "OK: $URL vrací HTTP 200"
      exit 0
    fi
    echo "Pokus $i/$MAX_ATTEMPTS: $URL vrátil HTTP $code"
  else
    echo "Pokus $i/$MAX_ATTEMPTS: $URL nedostupný (čekám ${SLEEP}s...)"
  fi
  [ "$i" -lt "$MAX_ATTEMPTS" ] && sleep "$SLEEP"
done

echo "CHYBA: $URL nevrátil HTTP 200 po $MAX_ATTEMPTS pokusech"
exit 1
