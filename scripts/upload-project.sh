#!/usr/bin/env bash
# Uploads a static client preview to production, served by nginx at https://romanantl.cz/projekty/<name>/
# Usage: ./scripts/upload-project.sh <name> <local-dir-or-index.html>
# Example: ./scripts/upload-project.sh terka ./previews/terka
#
# Files land in /home/www/romanantl.cz/projekty/<name>/ (outside the Docker image, so redeploys keep them).
# The target folder is mirrored with --delete, so files removed locally are removed on the server too.

set -euo pipefail

SSH_HOST="${UPLOAD_SSH_HOST:-hetzner}"
REMOTE_ROOT="/home/www/romanantl.cz/projekty"
PUBLIC_URL="https://romanantl.cz/projekty"

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <name> <local-dir-or-index.html>" >&2
  exit 1
fi

NAME="$1"
SOURCE="$2"

# Only allow safe URL slugs to avoid path traversal on the server
if ! [[ "$NAME" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "Error: name must contain only lowercase letters, digits and '-' (got '$NAME')" >&2
  exit 1
fi

if [ -d "$SOURCE" ]; then
  if [ ! -f "$SOURCE/index.html" ]; then
    echo "Error: $SOURCE/index.html not found" >&2
    exit 1
  fi
  RSYNC_SOURCE="${SOURCE%/}/"
elif [ -f "$SOURCE" ]; then
  if [ "$(basename "$SOURCE")" != "index.html" ]; then
    echo "Error: a single file upload must be named index.html" >&2
    exit 1
  fi
  RSYNC_SOURCE="$SOURCE"
else
  echo "Error: $SOURCE does not exist" >&2
  exit 1
fi

ssh "$SSH_HOST" "mkdir -p '$REMOTE_ROOT/$NAME'"
rsync -av --delete --exclude ".DS_Store" "$RSYNC_SOURCE" "$SSH_HOST:$REMOTE_ROOT/$NAME/"
# Make sure nginx can read everything (macOS openrsync has no --chmod)
ssh "$SSH_HOST" "chmod -R u=rwX,go=rX '$REMOTE_ROOT/$NAME'"

echo "Done: $PUBLIC_URL/$NAME/"
