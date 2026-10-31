# links monorepo — status

Date: 2026-10-31. Local only; nothing pushed, no remote server access.

## Layout

```
~/dev/projects/links/          clone of github.com/mhmdsami/links
├── package.json               root tooling only (gate, hooks:install)
├── lefthook.yml               commit-msg → commitlint; pre-push → scripts/gate.sh
├── commitlint.config.js
├── scripts/gate.sh            runs api → web → app gates
├── .github/workflows/
│   ├── api-ci.yml             paths api/**,  working-directory api
│   ├── web-deploy.yml         paths web/**,  working-directory web
│   └── app-android.yml        paths app/**,  working-directory app
├── api/                       Hono + Bun + Drizzle + better-auth
│   └── docs/auth-wiring.patch
├── web/                       Next.js 16 + OpenNext dashboard
└── app/                       Expo app (imported from mhmdsami/linx)
```

Commits:

- `525c92e refactor: move api into api workspace`
- `41d049d feat: import expo app from linx` (subtree, squashed content commit `5064358`)
- `a580bcb feat: restructure into api web and app monorepo`
- `STATUS.md` commit: HEAD after this file is committed.

The Expo app was imported with `git subtree add --prefix app
git@github.com:mhmdsami/linx.git main --squash`; linx history is present as a
squashed subtree commit, not per-commit.

## Package state

### api/

- Original repo content moved with `git mv` (history preserved): `src/`,
  `drizzle/`, `drizzle.config.ts`, `package.json`, `tsconfig.json`,
  `.env.example`, `.gitignore`, `bun.lockb`.
- better-auth wiring applied: handler mount in `src/index.ts`, session
  middleware in `src/routes/links.ts`, CORS with credentials for the web origin,
  local `src/lib/auth.ts` base mirror.
- `docs/auth-wiring.patch` holds all three hunks (the two requested patches +
  CORS). Apply it from inside `api/` on the server checkout.
- Scripts: `dev`, `migrate`, `generate`, `types`, `test` (bun test), `gate`.
  Tests: `src/schema/index.test.ts` (4 cases).
- Per-package lefthook/commitlint files removed; root owns hooks.

### web/

- Copied from the previously built `~/dev/projects/web` (including package-lock).
- Next.js 16, React 19, Tailwind 4, better-auth client, zod, OpenNext/Wrangler.
- Browser-side session gate (API cookie is host-only), link CRUD dashboard,
  copy/edit/delete, `/login` Google sign-in.
- `web/wrangler.jsonc` route: `links.sam1.space`.
- Scripts: `dev`, `build`, `types`, `test` (5 node:test cases), `gate`,
  `deploy`, `preview`.

### app/

- Expo SDK 51 / React Native client, imported from linx. Added `types`, `test`
  (placeholder → types), `lint` (`eslint .`), `gate`; `.eslintrc.js`;
  `package-lock.json` so `npm ci` works; fixed one `react/display-name` lint
  error in `components/input.tsx`.
- CI workflow lives at root: `.github/workflows/app-android.yml`.
- Legacy auth: still stores domain + `ADMIN_TOKEN` in SecureStore. Must migrate
  to better-auth before the API session middleware ships.

## Verification (all run locally)

```bash
cd ~/dev/projects/links
npm install
npm run hooks:install

cd api
npx bun@1.2.21 install
cp .env.example .env
npx bun@1.2.21 run migrate
npx bun@1.2.21 run gate        # tsc clean, 4/4 tests pass

cd ../web
npm install
NEXT_PUBLIC_API_URL=https://api.links.sam1.space npm run gate
# tsc clean, 5/5 tests, next build succeeds (/, /login, /icon.svg, 404)

cd ../app
npm install
npm run gate                   # tsc clean, eslint 0 errors / 5 warnings

cd ..
BUN_BIN="npx --yes bun@1.2.21" npm run gate   # all three, exit 0
```

Bun is not installed globally on this Mac; the API gate used
`npx bun@1.2.21`. `scripts/gate.sh` accepts `BUN_BIN` for this. Root commitlint
ran on the restructure commit and passed.

CI workflows were written but not executed (no push). Android build and web
deploy were not executed: no Android SDK locally and no Cloudflare credentials.

## User actions

1. **Google Cloud Console** — OAuth web client redirect URIs:
   - `https://api.links.sam1.space/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (local)
   Put `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in the API env.
2. **API env** on the server: `DATABASE_URL`, `BETTER_AUTH_URL`,
   `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
   `TRUSTED_ORIGINS=https://links.sam1.space`.
3. **Cloudflare** — Worker `links-web`, custom domain `links.sam1.space` (or
   edit `web/wrangler.jsonc`), token with Workers + DNS. GitHub repository
   needs:
   - secret `CLOUDFLARE_API_TOKEN`
   - variable `CLOUDFLARE_ACCOUNT_ID`
   - variable `NEXT_PUBLIC_API_URL=https://api.links.sam1.space`
4. **Push the monorepo** — `git push origin main`. Do this only after the
   Cloudflare secrets exist: the push touches `web/**`, so `web-deploy.yml`
   will run and fail without them. It also runs api tests and the Android build
   for the other paths.
5. **Delete `mhmdsami/linx`** after confirming the app is in `app/` and the
   Android workflow runs. Nothing in the monorepo fetches from linx.
6. **Apply the API patch** on the server (when online):
   `cd <checkout>/api && git apply docs/auth-wiring.patch` (review with
   `git apply --check` first), then `bun install && bun run migrate`, restart.

## Server-side follow-up (ops, do not attempt here)

The API checkout now lives inside a monorepo, so the systemd unit must change:

- `WorkingDirectory` must point at the `api/` directory (e.g. the server's
  equivalent of `<repo>/api`), not the repository root.
- `ExecStart` must still run `src/index.ts` from that directory (e.g.
  `bun run src/index.ts` / `bun run dev` as configured today); update any
  relative paths.
- Re-run `bun install`, ensure `.env` is present in `api/`, run
  `bun run migrate`, then restart the service.
- Apply `api/docs/auth-wiring.patch` and verify:
  - `GET /api/auth/get-session` responds (200, null body when signed out).
  - `GET /admin/link/all` returns 401 without a session cookie.

The ops session owns this; this session did not touch the server.

## Unresolved / caveats

- Expo app still uses `ADMIN_TOKEN`; deploying the new middleware breaks it
  until the app moves to better-auth sessions.
- Android release APK uses Expo's debug signing (no keystore); not store-ready.
- `app/bun.lockb` is stale relative to the updated `app/package.json` (CI uses
  `package-lock.json`/npm). Run `bun install` in `app/` if switching to Bun.
- Auth tables are not in the monorepo migrations; assumed already migrated on
  the server.
- Web/API domains are assumed to be `sam1.space`; adjust `wrangler.jsonc`,
  `NEXT_PUBLIC_API_URL`, and `TRUSTED_ORIGINS` if not.
- CI path filters mean root-only changes (README, hooks) do not trigger any
  workflow; that is intentional.
