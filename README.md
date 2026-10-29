# romanantl.cz
Personal website built with Astro (prerendered pages and a Node server for the contact API), React islands, and Tailwind CSS. Production runs in Docker (see `Dockerfile` and `docker-compose.yml`).

## Client previews (`/projekty/<name>/`)
Static HTML previews for clients are served by the host nginx directly from `/home/www/romanantl.cz/projekty/` on the production server (a `location ^~ /projekty/` block in the nginx vhost, placed before the proxy to the Docker app). They live outside the Docker image, so redeploys do not touch them. Responses carry `X-Robots-Tag: noindex, nofollow` and directory listing is disabled.

Upload (mirrors the local folder, files removed locally are removed on the server too):
```bash
./scripts/upload-project.sh terka ./path/to/terka   # folder containing index.html (+ assets)
```
Result: `https://romanantl.cz/projekty/terka/`. Remove a preview with `ssh hetzner 'rm -rf /home/www/romanantl.cz/projekty/terka'`.

## CRM (`/crm`)
Password-protected internal CRM for web outreach. After login (`/crm/login`, password `CRM_PASSWORD`) a signed `HttpOnly` cookie keeps the session for 30 days. Data is stored in SQLite (`node:sqlite`, built into Node 24, no extra dependency) at `<CRM_DATA_DIR>/crm.db` (default `./data`).

Modules (top navigation, defined in `src/lib/crm/navigation.ts`):
- **Klienti** (`/crm/klienti`): list with search and filters (status, web potential, has e-mail, next step due today) and sorting by clicking the column headers (1st click descending, 2nd ascending, 3rd back to the default order by web score; `?razeni=firma|kontakt|web|stav|krok&smer=asc|desc`, whitelisted in `src/lib/crm/clients/sorting.ts`; company names use Czech collation), client card `/crm/klienti/<id>` where every field is editable (pipeline: status, next step + date, call note, who called; contact: name, phone, web, e-mails, address, Google Maps, rating; web audit: potential, score, problems, platform, mobile performance), with the client's e-mail history and a delete button (sent e-mails stay in the log). New clients can be added by hand at `/crm/klienti/novy` (source "ručně").
- **Import** (`/crm/klienti/import`): CSV upload. Accepts the lead Google Sheet exported as CSV (Czech headers: Stav kontaktu, Název firmy, Web, ...) and the scraper's `leady_*.csv` / `companies_*.csv`. Clients are matched by Google Maps `cid` (fallback: website, then name), so the import can be repeated: contact and audit data are updated from non-empty cells, while status, next step and notes are only filled in where the CRM has nothing yet.
- **Napsat e-mail** (`/crm/email?klient=<id>`): the "e-mail před telefonátem" template (`src/lib/crm/outreach/email-template.ts`, source `scripts/google-places/email_before_call.md`) prefilled from the client, live preview, sending over SMTP (nodemailer, `CRM_SMTP_*`; port 465 uses implicit TLS, any other port must upgrade via STARTTLS. Production uses Migadu on port 587 because Hetzner blocks outbound 465). Sender details are saved as named sender profiles ("Uložit jako výchozí", table `sender_profiles`, API `/api/crm/sender-profiles`); the selected profile is prefilled on every e-mail and each browser remembers which profile it uses. A not yet contacted client moves to "e-mail odeslán".
- **Odeslané e-maily** (`/crm/emaily`): log of sent e-mails and unsubscribed contacts.

Unsubscribe: every e-mail contains a personal link `/odhlaseni?t=<token>` (also in the `List-Unsubscribe` header). The token is the recipient address signed with `CRM_SECRET`, so changing the secret breaks already sent links. Unsubscribing blocks further e-mails to that address and sets matching clients to "nevolat". A repeated e-mail to the same address needs explicit confirmation.

Code layout: `src/lib/crm/` (shared: `db.ts` connection, `migrations.ts`, auth, config), one folder per module (`clients/`, `outreach/`), pages under `src/pages/crm/`, JSON API under `src/pages/api/crm/` (protected by `src/middleware.ts`). Adding a module: append a migration to `MIGRATIONS` (never edit an applied one), add a folder in `src/lib/crm/`, pages under `/crm/<module>` using `CrmLayout` with `nav`, and an entry in `CRM_NAVIGATION`.

Notes:
- SQLite runs with a rollback journal (not WAL): WAL shared memory is not coherent across a Docker bind mount on macOS, and reading the DB from the host while the container runs could lose data.
- In production `CRM_DATA_DIR` is the `./data:/app/data` volume from `docker-compose.prod.yml`; the host directory must be writable by uid 1000 (`node` user). Back up `data/crm.db`.
- Login is rate limited (10 failed attempts per IP per 15 minutes). CRM pages and the unsubscribe page are `noindex` and excluded from the sitemap.
- All CRM requests are JSON `fetch` calls (including the CSV import), so Astro's origin check (`security.checkOrigin`) does not block them behind the nginx proxy.
- Node prints a one-time `ExperimentalWarning: SQLite is an experimental feature` on start; it is harmless.

Env variables: see `.env.example` (`CRM_PASSWORD`, `CRM_SECRET`, `CRM_SMTP_HOST`, `CRM_SMTP_PORT`, `CRM_SMTP_USER`, `CRM_SMTP_PASSWORD`, `CRM_SMTP_FROM`, `CRM_DATA_DIR`).

Local development: `docker compose -f docker-compose.dev.yml up -d --build` (hot reload on http://localhost:3000) and `npm run dev:smtp` on the host. With `CRM_SMTP_HOST=host.docker.internal` and `CRM_SMTP_PORT=2525` in `.env`, e-mails are not delivered but saved as `.eml` files to `data/dev-mail/` (open them in Mail.app to see the result).
