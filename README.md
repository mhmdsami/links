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
| `api` | Bun 1.4 | Link CRUD, redirects, better-auth Google sessions | `bun run dev` |
| `web` | Node 24 LTS / Workers | Sign-in, link management dashboard | `npm run dev` |
| `app` | Expo SDK 58 | Mobile link management | `npm start` |

## Runtime versions (October 2026)

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 24.x active LTS | `engines.node: ">=24 <25"`, `.nvmrc` = `24`; CI uses `node-version: 24` |
| Bun | 1.4.x (1.4.4) | latest stable; Bun has no LTS channel, so the major is pinned in `engines.bun` and CI |
| Java | Temurin 21 LTS | Android CI only |
| TypeScript | 7.0.2 (api, web); 6.0.3 (app) | no LTS concept; Expo SDK 58's template pins `~6.0.3` |
| Expo SDK | 58 (RN 0.88.1, React 19.3.0) | SDK 58 supports Node 24 and JDK 21 |
| Next.js / React | 16.4.3 / 19.3.1 | web |
| Hono / Drizzle / better-auth | 4.13.14 / 0.45.4 (kit 0.31.11) / 1.7.14 | api, Zod 3.25.76 |

TypeScript and Bun do not have LTS channels; "latest stable" is the policy for
both. TypeScript 7 is used everywhere it works (Expo 58 pins TS 6).

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
BUN_BIN="npx --yes bun@1.4.4" npm run gate
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
- `.github/workflows/app-android.yml` — `app/**`: Node 24, Temurin 21, Expo
  SDK 58 prebuild, Gradle release APK artifact.

`web/wrangler.jsonc` binds `links.sam1.space`. Change the route if the domain
differs.

## Follow-ups

- The Expo app still authenticates with `ADMIN_TOKEN`; the API has moved to
  better-auth sessions. Migrate the app before deploying the new middleware.
- The server checkout must move from the old repo root to `links/api`
  (systemd `WorkingDirectory` and `ExecStart`). Owned by the ops session.
