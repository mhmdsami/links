# links API

Hono API running on Cloudflare Workers with D1 and better-auth (Google).
All routes live under `/api/*` on the web hostname.

## Requirements

- Bun 1.4.4 for package management and tests
- Node.js 24.x LTS (`engines.node: ">=24 <25"`)
- Wrangler 4.156.0
- TypeScript 7.0.2

## Local development

```bash
bun install
cp .dev.vars.example .dev.vars
bun run db:migrate:local
bun run dev
```

The Worker listens on port 3000. `wrangler dev` reads bindings from
`wrangler.jsonc` and local values from `.dev.vars`.

`LOCAL_PREVIEW=1` bypasses auth on admin routes when `BETTER_AUTH_URL` points
at localhost.

## Routes

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Health check |
| `GET/POST /api/auth/*` | better-auth, including the Expo deep-link proxy |
| `/api/admin/link/*` | Authenticated link CRUD |
| `GET /api/redirect/:code` | Returns the destination and records a click |

The web Worker owns short-link redirects and calls `/api/redirect/:code`.

## Database

D1 binding `DB`, database `links-db`.

```bash
bun run generate            # drizzle-kit generate
bun run db:migrate:local    # apply to the local Wrangler D1
bun run db:migrate:remote   # apply to the production D1
```

To import an old SQLite database once:

```bash
./scripts/import-sqlite.sh path/to/db.sqlite
```

## Environment

Production values in `wrangler.jsonc`:

- `BETTER_AUTH_URL`: web origin plus `/api/auth`
- `TRUSTED_ORIGINS`: web origin and `links://`

Worker secrets:

- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

```bash
bunx wrangler secret put BETTER_AUTH_SECRET
bunx wrangler secret put GOOGLE_CLIENT_ID
bunx wrangler secret put GOOGLE_CLIENT_SECRET
```

Google redirect URI: `/api/auth/callback/google` on the web origin.

## Scripts

```bash
bun run dev               # wrangler dev
bun run deploy            # wrangler deploy
bun run types             # tsc --noEmit
bun run test              # bun test
bun run gate              # types && test
```

Hooks live at the repository root in `lefthook.yml`. Install them once with
`bun run hooks:install` from the root.
