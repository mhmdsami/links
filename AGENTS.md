# AGENTS.md

## Architecture

- `api/` is a Hono Worker on Cloudflare with a D1 binding named `DB`.
- `web/` is a Next.js app on Cloudflare via OpenNext.
- Both share one hostname: `/api/*` routes to the API Worker, everything else
  including `/:code` redirects goes to the web Worker.
- There is no server process, VM, tunnel, reverse proxy, or certificate job.
  Do not add one.
- Sessions are same-origin. Do not reintroduce CORS or credential flags.
- Short-link clicks are recorded by `GET /api/redirect/:code`; the web
  `app/[code]` route calls it through the `API` service binding and returns the
  302.

## Commands

```bash
bun install                    # root tooling
bun run hooks:install
bun run gate                   # api + web + app

cd api
bun install
cp .dev.vars.example .dev.vars
bun run db:migrate:local
bun run dev                    # wrangler dev on :3000
bun run gate
bun run deploy

cd web
bun install
bun run dev                    # :3001, /api/* rewrites to :3000
bun run gate

cd app
bun install
bun start
bun run gate
```

## Conventions

- API routes live under `/api/*`. Admin routes are `/api/admin/link/*`.
- Migrations are generated with `bun run generate` and applied with
  `bun run db:migrate:local` or `bun run db:migrate:remote`.
- Secrets live in Worker secrets; local values live in `api/.dev.vars`.
- Do not commit `.dev.vars`, `.env`, SQLite files, or `.wrangler/`.
