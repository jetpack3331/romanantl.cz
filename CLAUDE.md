@../AGENTS.md

## Communication language

The user communicates in Czech. Always reply in **Czech** (chat responses, summaries, questions), never in
English. Code, code comments and commit messages stay in English as required by AGENTS.md.

## Project-specific overrides (romanantl.cz)

This project does **not** use Next.js, despite what the global instructions above say (those are shared
across other `~/dev` projects that are Next.js). The actual stack here:

- **Framework:** Astro (v5, `output: "server"` with `@astrojs/node` adapter), prerendered pages + a
  server-rendered contact API route.
- **UI:** Astro components (`.astro`) for static/server-rendered markup, React only for the interactive
  `ContactForm` island (`client:load`).
- **Styling:** Tailwind CSS.
- **i18n:** `cs` (default, no URL prefix), `en`, `es` under `/en` and `/es`. See `src/lib/i18n.ts`,
  `src/messages/*.json`, `src/lib/get-messages.ts`.
- **Testing:** Vitest (not Jest).

So ignore any Next.js-specific guidance from the global file (App Router, Server Components, `proxy.ts`,
`getServerSideProps`, etc.) — none of it applies here. Use `src/middleware.ts` (Astro middleware), Astro
API routes under `src/pages/api/`, and `node_modules/astro/` docs when in doubt.

## Production server & deployment

- **Access:** `ssh hetzner` (logs in as `root`). Shared Hetzner VPS hosting several other sites/containers, so
  never restart Docker globally or touch other vhosts. Confirm with the user before changing anything on the server.
- **App dir:** `/home/www/romanantl.cz/` - contains `docker-compose.yml` (copy of `docker-compose.prod.yml`), `.env`
  (holds `IMAGE=` and secrets, never print it), `projekty/` (client previews, see below) and `data/` (CRM volume
  mounted at `/app/data` with the SQLite database `crm.db`, owned by uid 1000; never delete it, back it up).
- **Container:** `romanantlcz-web-1`, listens on `127.0.0.1:3004` -> container port 3000.
- **nginx:** host nginx terminates TLS (Let's Encrypt). The live vhost is the regular file
  `/etc/nginx/sites-enabled/romanantl.cz` (not a symlink; `sites-available/romanantl.cz` is a stale copy).
  Repo mirror: `deploy/nginx/romanantl.cz.conf` - keep it in sync when editing the server config.
  Always back up first, then `nginx -t && systemctl reload nginx`.

### Deploy flow (automatic)
1. Push to `main` -> `.github/workflows/deploy.yml` builds the Docker image and pushes it to
   `ghcr.io/jetpack3331/romanantl.cz` (tags `latest` and `sha-<commit>`).
2. The workflow POSTs to `https://romanantl.cz/hooks/deploy-romanantl` (nginx `/hooks/` -> `webhook` service on
   `127.0.0.1:9000`, config `/etc/webhook/hooks.json`, token in GitHub secret `DEPLOY_WEBHOOK_TOKEN`).
3. The hook runs `/usr/local/bin/deploy-romanantl.sh`: sets `IMAGE=<sha image>` in `.env`, `docker compose pull`,
   `docker compose up -d --force-recreate`, then health-checks `http://127.0.0.1:3004/`.
   Log: `/var/log/deploy-romanantl.log`.
- Manual redeploy: re-run the workflow (`gh workflow run deploy.yml`) or on the server
  `cd /home/www/romanantl.cz && docker compose pull && docker compose up -d --force-recreate`.
- First-time server setup: `deploy/vps/bootstrap.sh`.

### Client previews (`/projekty/<name>/`)
- Static HTML served by nginx straight from `/home/www/romanantl.cz/projekty/<name>/` (`location ^~ /projekty/`,
  `noindex`, no directory listing). Not part of the Astro app or the Docker image, so redeploys keep them.
- Upload: `./scripts/upload-project.sh <name> <folder-with-index.html | index.html>` (rsync with `--delete`,
  name must match `^[a-z0-9][a-z0-9-]*$`). Result: `https://romanantl.cz/projekty/<name>/`.
- Remove: `ssh hetzner 'rm -rf /home/www/romanantl.cz/projekty/<name>'`.
- Don't create an Astro route under `/projekty` - nginx would shadow it.

### Scripts
- `scripts/upload-project.sh` - upload a client preview (above).
- `scripts/check-web.sh` / `npm run check:web` - waits until a URL (default `http://localhost:3000`) returns 200.
- `npm run build | test | lint | check | dead-code` - Astro build, Vitest, ESLint, `astro check`, knip.
