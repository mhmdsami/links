# links monorepo status

Date: 2026-11-02. `main` is pushed and in sync with the remote. The working
tree is clean apart from this docs edit.

## Versions (LTS / latest stable, October 2026)

| Package | Tool | Version | Note |
| --- | --- | --- | --- |
| root | Node.js | 24.x LTS | `engines ">=24 <25"`, `.nvmrc` = 24 |
| root | commitlint / lefthook | 21.2.4 / 2.2.2 | latest stable |
| api | Bun | 1.4.4 | no LTS channel; major pinned in `engines.bun` and CI |
| api | TypeScript | 7.0.2 | no LTS concept |
| api | Hono | 4.13.14 | latest 4.x |
| api | better-auth | 1.7.14 | latest 1.x |
| api | drizzle-orm / drizzle-kit | 0.45.4 / 0.31.11 | latest compatible pair |
| api | drizzle-zod | 0.7.1 | pinned; 0.8.x needs Zod 4 types, policy is Zod 3 |
| api | zod | 3.25.76 | latest 3.x |
| api | @types/bun | 1.4.4 | latest |
| web | Node.js | 24.x LTS | `engines ">=24 <25"`, `.nvmrc` = 24 |
| web | Next.js / React | 16.4.3 / 19.3.1 | latest stable in their majors |
| web | Tailwind CSS | 4.3.3 | latest 4.x |
| web | @opennextjs/cloudflare | 1.20.15 | latest |
| web | better-auth / lucide-react | 1.7.14 / 1.65.0 | latest |
| web | TypeScript / wrangler | 7.0.2 / 4.156.0 | latest stable |
| app | Expo SDK | 58.0.21 | upgraded from SDK 51 |
| app | React Native / React | 0.88.1 / 19.3.0 | SDK 58 bundled versions |
| app | expo-router | 58.0.28 | SDK 58 |
| app | TypeScript | 6.0.3 | Expo SDK 58 template pin (`~6.0.3`); TS 7 not used here |
| app | ESLint | 9.39.5 | eslint-config-expo 58 supports 8/9; ESLint 10 is not supported |
| app | Java (Android CI) | Temurin 21 LTS | Gradle 9.4.1 from SDK 58 supports JDK 21 |

Deliberate non-latest pins:

- `drizzle-zod 0.7.1`: 0.8.3 type declarations import `zod/v4`, which does not
  match the Zod 3 policy. 0.7.1 type-checks with Zod 3 and drizzle-orm 0.45.
- `TypeScript 6.0.3` in the app: Expo SDK 58 pins `~6.0.3` and does not support
  TypeScript 7.
- `ESLint 9.39.5` in the app: `eslint-config-expo@58` supports ESLint 8 and 9,
  but ESLint 10 drops the config interfaces it uses.
- `@babel/core 7.29.7`: React Native 0.88's `babel-preset-expo` toolchain still
  uses Babel 7.
- `Bun 1.4.4`: no LTS channel. Pinned in `api/package.json` and `api-ci.yml`.

## Layout

```
links/
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
└── app/                       Expo app
```

Commits:

- `525c92e refactor: move api into api workspace`
- `41d049d feat: import expo app from linx` (subtree, squashed content commit `5064358`)
- `a580bcb feat: restructure into api web and app monorepo`
- `db1b656 docs: add monorepo status`
- `76927ac chore: upgrade runtimes and dependencies to latest stable`
- `82f4ddf feat(api): add bearer and expo auth plugins`
- `37734a7 feat(app): migrate authentication to better-auth`
- `ab278de docs: record app auth migration and deploy handoff`
- this docs edit is the latest commit.

The Expo app was imported as a squashed subtree, so its history is one content
commit rather than the full per-commit history.

## Package state

### api/

- Original repository content moved with `git mv`, preserving history: `src/`,
  `drizzle/`, `drizzle.config.ts`, `package.json`, `tsconfig.json`,
  `.env.example`, `.gitignore`, `bun.lockb`.
- better-auth wiring: handler mount in `src/index.ts`, session middleware in
  `src/routes/links.ts`, CORS with credentials for the web origin, and a local
  `src/lib/auth.ts` mirror.
- `src/lib/auth.ts` enables the `expo()` and `bearer()` plugins. The Expo app
  signs in through `/expo-authorization-proxy` and calls `/admin/link/*` with
  `Authorization: Bearer <session-token>`.
- Origin configuration uses `TRUSTED_ORIGINS` in code, `.env.example`, and the
  READMEs. `WEB_ORIGIN` does not exist in the repository.
- `docs/auth-wiring.patch` holds the two route hunks and the CORS change. It
  does not touch `src/lib/auth.ts`; the server copy needs the plugin additions
  listed in the deployment section.
- Scripts: `dev`, `migrate`, `generate`, `types`, `test` (bun test), `gate`.
  Tests: `src/schema/index.test.ts` (4 cases).
- Per-package lefthook and commitlint files were removed; the root owns hooks.

### web/

- Next.js 16, React 19, Tailwind 4, better-auth client, zod, OpenNext, and
  Wrangler.
- Browser-side session gate because the API cookie is host-only. The dashboard
  covers link CRUD, copy, edit, delete, and `/login` Google sign-in.
- `wrangler.jsonc` binds the production web hostname.
- Scripts: `dev`, `build`, `types`, `test` (5 node:test cases), `gate`,
  `deploy`, `preview`.

### app/

- Upgraded from Expo SDK 51 to SDK 58: Expo 58.0.21, React Native 0.88.1,
  React 19.3.0, expo-router 58.0.28, and React 19-safe module versions.
  `npm install` and `npx expo install --check` pass. `expo-doctor` was 20/20 at
  the time and is 19/20 now because newer patch releases appeared (see
  Verification).
- Added `types`, `test` (runs types), `lint` (`eslint .`), and `gate`. Migrated
  to the ESLint 9 flat config. Added `package-lock.json` for `npm ci` and
  removed the stale `bun.lockb`.
- SDK upgrade fixes: React Native 0.88 ref types
  (`ComponentRef<typeof TextInput>`), zero-argument `Button.onPress` for
  react-hook-form compatibility, the `expo-splash-screen` config plugin, and
  removal of tsconfig `baseUrl` for TypeScript 6.
- `npx expo prebuild --platform android --clean --no-install` succeeds with
  Gradle 9.4.1. The release build still uses Expo's debug signing.
- CI lives at `.github/workflows/app-android.yml` (Node 24, Temurin 21).
- Auth uses better-auth sessions instead of a domain plus `ADMIN_TOKEN`:
  - `app/lib/auth-client.ts` creates the client with the `@better-auth/expo`
    plugin (`scheme: "links"`, SecureStore cookie jar). The base URL comes from
    `EXPO_PUBLIC_API_URL`.
  - `app/lib/session.ts` extracts the signed session cookie, stores it under
    `STORAGE_KEYS.TOKEN`, and builds the bearer header. On startup it deletes
    the legacy domain and token keys so stale credentials are never sent.
  - The config screen handles Google sign-in, sign-out, and the API origin.
    Create, list, edit, and delete call the API origin directly. Link copy uses
    the API host and the short code.
  - Added `better-auth@1.7.14`, `@better-auth/expo@1.7.14`, and `expo-network`.
    `.npmrc` sets `legacy-peer-deps=true` because better-call declares an
    optional zod 4 peer while the app uses zod 3. `npm ci` works with it.
  - Gate: tsc clean, eslint 0 errors and 0 warnings.

## Verification

Commands run locally:

```bash
cd api
npx bun@1.4.4 install --frozen-lockfile
cp .env.example .env
npx bun@1.4.4 run migrate
npx bun@1.4.4 run gate        # tsc clean, 4/4 tests pass

cd ../web
npm ci
NEXT_PUBLIC_API_URL=<api-origin> npm run gate
# tsc clean, 5/5 tests, next build succeeds (/, /login, /icon.svg, 404)

cd ../app
npm ci
npx expo-doctor               # 19/20; newer patch releases appeared after this pass
npm run gate                  # tsc clean, eslint 0 errors / 0 warnings

cd ..
BUN_BIN="npx --yes bun@1.4.4" npm run gate   # all three, exit 0
```

`expo-doctor` reports newer patch releases for `expo` (58.0.22 vs 58.0.21),
`expo-router` (58.0.29 vs 58.0.28), and `@expo/metro-runtime` (58.0.16 vs
58.0.15). These appeared in the registry after the previous pass and were not
bumped.

Bun is not installed globally on the development machine, so the API gate uses
`npx bun@1.4.4` through `BUN_BIN`. Root commitlint runs on commits. Lockfiles
were refreshed, and both `npm ci` and `bun install --frozen-lockfile` succeed.

CI after the push:

- API CI: passed.
- Web Deploy: passed after the Cloudflare secret and variable were added.
- App Android: release build was still running at the time of this note.

## Remaining actions

1. Google Cloud Console: confirm the OAuth web client has the
   `/api/auth/callback/google` path registered for the production API origin and
   for the local API origin. Put `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   in the API env.
2. Delete the earlier standalone app repository once the app in `app/` and the
   Android workflow are confirmed. Nothing in this monorepo fetches from it.
3. Deploy the API using the handoff below. App sign-in does not work until the
   deployment includes the new plugins.

## Server deployment handoff (ops)

The code is pushed. On the server:

1. Check out the monorepo and enter the API workspace: `cd <repo>/api`.
2. Run `bun install --frozen-lockfile` to pick up `@better-auth/expo`.
3. Set `api/.env`:
   - `DATABASE_URL`, `BETTER_AUTH_URL` (public API origin),
     `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `TRUSTED_ORIGINS` to the production web origin plus `links://`. Add the
     local web origin only when the web app runs locally against this API. Add
     `exp://**` only for Expo Go development.
4. Apply the routes patch if it is not already applied:
   `git apply --check docs/auth-wiring.patch && git apply docs/auth-wiring.patch`.
   If the reverse check succeeds, it is already applied; do not re-apply.
5. Update the canonical `src/lib/auth.ts` on the server to match the new plugin
   wiring:

   ```ts
   import { expo } from "@better-auth/expo";
   import { bearer } from "better-auth/plugins";

   export const auth = betterAuth({
     // ...existing baseURL / secret / database / socialProviders / trustedOrigins
     plugins: [expo(), bearer()],
   });
   ```

   Without `bearer()`, the app's bearer requests return 401. Without `expo()`,
   the app's Google flow calls a missing `/expo-authorization-proxy`.
6. Run `bun run migrate`. The auth tables (`user`, `session`, `account`,
   `verification`) are assumed to exist on the server. If they do not, generate
   them from the canonical better-auth schema before restarting.
7. Update the systemd unit: `WorkingDirectory` must be `<repo>/api`, and
   `ExecStart` must run `src/index.ts` from there. Restart the service.
8. Smoke test:
   - `curl -i <api-origin>/` returns 200.
   - `curl -i <api-origin>/api/auth/get-session` returns 200 with a null body
     when signed out.
   - `curl -i <api-origin>/admin/link/all` returns 401.
   - `curl -i -H "Authorization: Bearer nope" <api-origin>/admin/link/all`
     returns 401.
   - App: Google sign-in, then create, list, edit, and delete a link.
   - Web dashboard: Google sign-in still works through the cookie path.

No new Google redirect URI is needed for the app. Native sign-in still uses the
API's `/api/auth/callback/google` web redirect.

## Unresolved and caveats

- The app depends on the new API plugins (`bearer`, `expo`). Until the API is
  deployed and the server `src/lib/auth.ts` is updated, app sign-in and admin
  requests fail. The web dashboard is unaffected.
- The `links://` scheme must be in the API's `TRUSTED_ORIGINS`. Otherwise the
  Expo plugin will not append the session cookie to the deep-link redirect.
- `.npmrc` uses `legacy-peer-deps` because better-call peers zod 4 while the app
  uses zod 3. Revisit when that optional peer is relaxed.
- The Android release APK uses Expo's debug signing and no keystore, so it is
  not store-ready. `assembleRelease` was not run locally; `expo prebuild` and
  `expo-doctor` were.
- Auth tables are not in the monorepo migrations and are assumed to be migrated
  on the server.
- Hostnames are configured in `wrangler.jsonc` and the environment variables.
  Update those when the hostnames change.
- CI path filters mean root-only changes such as README and hook edits do not
  trigger a workflow. That is intentional.
- TypeScript 7.0.2 is used for api and web; the app stays on 6.0.3 per the Expo
  SDK 58 template. TypeScript and Bun have no LTS channels.
