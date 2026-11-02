# links

A short-link service with one API Worker, one web dashboard, and one Expo app
in a single repository.

```
links/
├── api/   Hono on Cloudflare Workers + D1 + better-auth (Google)
├── web/   Next.js 16 dashboard on Cloudflare Workers via OpenNext
└── app/   Expo / React Native client
```

The web app and API share one hostname. Requests under `/api/*` go to the API
Worker; everything else goes to the web Worker. Short-link redirects are handled
by the web Worker, which asks the API to record the click.

## Packages

| Package | Runtime | What it does | Local dev |
| --- | --- | --- | --- |
| `api` | Cloudflare Workers + D1 | Link CRUD, redirect data, better-auth sessions | `bun run dev` |
| `web` | Node 24 / Workers | Sign-in, link management dashboard, short-link redirects | `bun run dev` |
| `app` | Expo SDK 58 | Mobile link management | `bun start` |

## Runtime versions (October 2026)

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 24.x active LTS | `engines.node: ">=24 <25"`, `.nvmrc` = `24` |
| Bun | 1.4.4 | Package manager and test runner; the API no longer runs on Bun |
| Wrangler | 4.156.0 | API Worker, D1 migrations, deploys |
| TypeScript | 7.0.2 (api, web); 6.0.3 (app) | Expo SDK 58 pins `~6.0.3` |
| Hono / Drizzle / better-auth | 4.13.14 / 0.45.4 / 1.7.14 | api |
| Expo SDK | 58 | React Native 0.88.1, React 19.3.0 |
| Next.js / React | 16.4.3 / 19.3.1 | web |

## Setup

```bash
bun install                 # root tooling (lefthook, commitlint)
bun run hooks:install       # installs commit-msg + pre-push hooks
```

Install dependencies in the package you are working on:

```bash
cd api && bun install && cp .dev.vars.example .dev.vars && bun run db:migrate:local && bun run dev
cd web && bun install && bun run dev
cd app && bun install && bun start
```

The API Worker listens on port 3000 and the web app on 3001. In development,
Next rewrites `/api/*` to the API Worker so both share an origin.

## Gates

```bash
cd api && bun run gate        # tsc + bun test
cd web && bun run gate        # tsc + node:test + next build
cd app && bun run gate        # tsc + eslint
bun run gate                  # all three from the root
```

## Architecture

- **No server process.** The API runs as a Cloudflare Worker with a D1 database.
  There is no VM, systemd unit, tunnel, reverse proxy, or certificate job.
- **One hostname.** `links.sam1.space/api/*` routes to the API Worker and
  `links.sam1.space/*` routes to the web Worker. Same-origin requests mean
  better-auth cookies work without CORS or credential flags.
- **Short links** stay on the web hostname. A catch-all route asks the API for
  the destination and records the click, then returns a 302.
- **Data** lives in D1. Migrations are generated with drizzle-kit and applied
  with `wrangler d1 migrations apply`.

The separate `links-api` hostname was retired because it added a second origin,
CORS, cookie, DNS, TLS, and server-maintenance work without any benefit.

## Environment

### api

Production values live in `api/wrangler.jsonc` (`vars`) and Worker secrets:

| Variable | Where | Notes |
| --- | --- | --- |
| `BETTER_AUTH_URL` | `wrangler.jsonc` | Web origin plus `/api/auth` |
| `TRUSTED_ORIGINS` | `wrangler.jsonc` | Web origin and `links://` |
| `BETTER_AUTH_SECRET` | secret | `wrangler secret put BETTER_AUTH_SECRET` |
| `GOOGLE_CLIENT_ID` | secret | Google OAuth web client |
| `GOOGLE_CLIENT_SECRET` | secret | Google OAuth web client |

Local development uses `api/.dev.vars`, copied from `.dev.vars.example`, with
`LOCAL_PREVIEW=1`.

Google redirect URI: the `/api/auth/callback/google` path on the web origin.

### web

No API URL is needed in production because the API is same-origin. For local
development without Google, set `NEXT_PUBLIC_LOCAL_PREVIEW=1` in
`web/.env.development.local`.

### app

`EXPO_PUBLIC_API_URL` defaults to the web origin. For local development against
a local Worker, point it at the local HTTP origin and set
`EXPO_PUBLIC_LOCAL_PREVIEW=1`.

## CI / deploy

- `.github/workflows/api-deploy.yml` runs on `api/**`: typecheck, tests, D1
  migrations, then `wrangler deploy`. Needs `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID`.
- `.github/workflows/api-ci.yml` runs the api checks on pull requests.
- `.github/workflows/web-deploy.yml` runs on `web/**`: typecheck, tests,
  OpenNext build, Cloudflare deploy.
- `.github/workflows/app-android.yml` runs on `app/**`: Expo prebuild and a
  release APK artifact.

## Follow-ups

- The ops session removes the old server runtime once the Worker is live.
- Redirect the old API hostname, if it still resolves, to the web origin.
