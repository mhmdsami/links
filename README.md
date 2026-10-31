# links

A personal short-link service: one API, one web dashboard, one Expo app, in a
single repository.

```
links/
├── api/   Hono + Bun + Drizzle + SQLite + better-auth (Google)
├── web/   Next.js 16 dashboard, deployed on Cloudflare Workers via OpenNext
└── app/   Expo / React Native client (imported from mhmdsami/linx)
```

Short-link redirects (`GET /:code`) are served by **api**, not by the dashboard.

## Packages

| Package | Runtime | What it does | Local dev |
| --- | --- | --- | --- |
| `api` | Bun | Link CRUD, redirects, better-auth Google sessions | `bun run dev` |
| `web` | Node 24 / Workers | Sign-in, link management dashboard | `npm run dev` |
| `app` | Expo SDK 51 | Mobile link management | `npm start` |

## Setup

```bash
npm install                 # root tooling (lefthook, commitlint)
npm run hooks:install       # installs commit-msg + pre-push hooks
```

Install each package where you work on it:

```bash
cd api && bun install && cp .env.example .env && bun run migrate && bun run dev
cd web && npm install && cp .env.example .env.local && npm run dev
cd app && npm install && npm start
```

The web dev server and the API both default to port 3000. Start one of them on
another port if they collide (the web app's API URL is `NEXT_PUBLIC_API_URL`).

## Gates

Each package has `types`, `test` (where applicable), and `gate`:

```bash
cd api && bun run gate        # tsc + bun test
cd web && npm run gate        # tsc + node:test + next build
cd app && npm run gate        # tsc + eslint
```

Run all three from the root:

```bash
npm run gate
# Bun is required for the api gate; override the binary if needed:
BUN_BIN="npx --yes bun@1.2.21" npm run gate
```

`lefthook.yml` at the root runs commitlint on `commit-msg` and the full gate on
`pre-push`.

## Environment

### api (`api/.env`)

| Variable | Required | Example / notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | `./links.db` (SQLite file) |
| `BETTER_AUTH_URL` | yes | `https://api.links.sam1.space` |
| `BETTER_AUTH_SECRET` | yes | long random string |
| `GOOGLE_CLIENT_ID` | yes | Google OAuth web client |
| `GOOGLE_CLIENT_SECRET` | yes | Google OAuth web client |
| `TRUSTED_ORIGINS` | yes | comma-separated browser origins, e.g. `https://links.sam1.space` (CORS + better-auth) |

Google redirect URI:
`https://api.links.sam1.space/api/auth/callback/google` (plus
`http://localhost:3000/api/auth/callback/google` for local dev).

### web (`web/.env.local`)

| Variable | Required | Example / notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | yes | `https://api.links.sam1.space`; inlined at build time |

The API must list the web origin in `TRUSTED_ORIGINS`. Keep web and API on the
same registrable domain so the better-auth session cookie is same-site.

### app

No build-time env. The app currently stores an API domain and admin token in
SecureStore (legacy `ADMIN_TOKEN` flow) — see the follow-up note below.

## CI / deploy

- `.github/workflows/api-ci.yml` — `api/**`: bun install, migrate, typecheck, tests.
- `.github/workflows/web-deploy.yml` — `web/**`: npm ci, typecheck, test,
  OpenNext build + Cloudflare deploy. Needs `CLOUDFLARE_API_TOKEN` (secret) and
  `CLOUDFLARE_ACCOUNT_ID`, `NEXT_PUBLIC_API_URL` (variables).
- `.github/workflows/app-android.yml` — `app/**`: Node 24, Temurin 17, Expo
  prebuild, Gradle release APK artifact.

`web/wrangler.jsonc` binds `links.sam1.space`. Change the route if the domain
differs.

## Follow-ups

- The Expo app still authenticates with `ADMIN_TOKEN`; the API has moved to
  better-auth sessions. Migrate the app before deploying the new middleware.
- The server checkout must move from the old repo root to `links/api`
  (systemd `WorkingDirectory` and `ExecStart`). Owned by the ops session.
