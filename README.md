# links

A short-link service with one API, one web dashboard, and one Expo app in a
single repository.

```
links/
├── api/   Hono + Bun + Drizzle + SQLite + better-auth (Google)
├── web/   Next.js 16 dashboard, deployed on Cloudflare Workers via OpenNext
└── app/   Expo / React Native client
```

Short-link redirects (`GET /:code`) are served by `api`, not by the dashboard.

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
| Bun | 1.4.x (1.4.4) | Latest stable. Bun has no LTS channel, so the major is pinned in `engines.bun` and CI. |
| Java | Temurin 21 LTS | Android CI only |
| TypeScript | 7.0.2 (api, web); 6.0.3 (app) | No LTS concept. The Expo SDK 58 template pins `~6.0.3`. |
| Expo SDK | 58 (RN 0.88.1, React 19.3.0) | SDK 58 supports Node 24 and JDK 21. |
| Next.js / React | 16.4.3 / 19.3.1 | web |
| Hono / Drizzle / better-auth | 4.13.14 / 0.45.4 (kit 0.31.11) / 1.7.14 | api, Zod 3.25.76 |

TypeScript and Bun do not have LTS channels, so both track the latest stable
release. TypeScript 7 is used wherever it works; Expo 58 pins TypeScript 6.

## Setup

```bash
npm install                 # root tooling (lefthook, commitlint)
npm run hooks:install       # installs commit-msg + pre-push hooks
```

Install dependencies in the package you are working on:

```bash
cd api && bun install && cp .env.example .env && bun run migrate && bun run dev
cd web && npm install && cp .env.example .env.local && npm run dev
cd app && npm install && npm start
```

The web dev server and the API both default to port 3000. Move one of them if
they collide. The web app finds the API through `NEXT_PUBLIC_API_URL`.

## Gates

Each package has `types`, `test` where applicable, and `gate`:

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

`lefthook.yml` runs commitlint on `commit-msg` and the full gate on `pre-push`.

## Environment

### api (`api/.env`)

| Variable | Required | Example / notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | `./links.db` (SQLite file) |
| `BETTER_AUTH_URL` | yes | Public API origin |
| `BETTER_AUTH_SECRET` | yes | Long random string |
| `GOOGLE_CLIENT_ID` | yes | Google OAuth web client |
| `GOOGLE_CLIENT_SECRET` | yes | Google OAuth web client |
| `TRUSTED_ORIGINS` | yes | Comma-separated web origin and `linx://` (CORS + better-auth) |

Register the `/api/auth/callback/google` path on the production API origin as a
Google redirect URI, and add the local API origin for development.

### web (`web/.env.local`)

| Variable | Required | Example / notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | yes | API origin; inlined at build time |

The API must list the web origin in `TRUSTED_ORIGINS`. Keep the web and API
hostnames on the same registrable domain so the better-auth session cookie is
same-site.

### app (`app/.env` optional)

| Variable | Required | Example / notes |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | no | API origin; defaults to the production API origin in `app/lib/auth-client.ts` |

The app signs in with Google through better-auth. The Expo plugin opens the
flow in `expo-web-browser` and returns to the `linx://` deep link, so that
scheme must be listed in the API's `TRUSTED_ORIGINS`. The app sends the session
token as `Authorization: Bearer <token>` to `/admin/link/*`.

## CI / deploy

- `.github/workflows/api-ci.yml` runs on `api/**`: bun install, migrate,
  typecheck, tests.
- `.github/workflows/web-deploy.yml` runs on `web/**`: npm ci, typecheck, test,
  OpenNext build, Cloudflare deploy. It needs `CLOUDFLARE_API_TOKEN` (secret)
  and `CLOUDFLARE_ACCOUNT_ID`, `NEXT_PUBLIC_API_URL` (variables).
- `.github/workflows/app-android.yml` runs on `app/**`: Node 24, Temurin 21,
  Expo SDK 58 prebuild, Gradle release APK artifact.

`web/wrangler.jsonc` binds the production web hostname. Change the route there
if the hostname changes.

## Follow-ups

- The server checkout moves from the old repository root to `links/api`
  (systemd `WorkingDirectory` and `ExecStart`), and the canonical
  `api/src/lib/auth.ts` needs the `expo()` and `bearer()` plugins. Exact steps
  are in `STATUS.md`.
