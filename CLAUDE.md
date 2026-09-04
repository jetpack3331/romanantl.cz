@../AGENTS.md

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
