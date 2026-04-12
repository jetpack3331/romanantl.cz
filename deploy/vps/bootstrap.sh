#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   sudo APP_DIR=/home/www/romanantl.cz \
#        GHCR_USER=<github_user> \
#        GHCR_TOKEN=<ghcr_pat_read_packages> \
#        ./deploy/vps/bootstrap.sh

APP_DIR="${APP_DIR:-/home/www/romanantl.cz}"

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

mkdir -p "$APP_DIR"
chown -R "$USER":"$USER" "$APP_DIR"

if [[ -n "${GHCR_USER:-}" && -n "${GHCR_TOKEN:-}" ]]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
fi

echo "Bootstrap done. Next steps:"
echo "1) copy docker-compose.prod.yml to $APP_DIR/docker-compose.yml"
echo "2) create $APP_DIR/.env"
echo "3) set IMAGE in $APP_DIR/.env (ghcr.io/jetpack3331/romanantl.cz:latest)"
echo "4) run: docker compose -f $APP_DIR/docker-compose.yml up -d"
