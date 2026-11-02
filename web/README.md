# links web

Web dashboard for the links short-link API. Next.js 16 (App Router) on
Cloudflare Workers through OpenNext, with better-auth (Google) and Tailwind
CSS 4. The palette matches the Expo app.

Public redirects (`GET /:code`) are served by the API, never by this app. The
dashboard only authenticates users and manages links.

## Env

| Variable | Where | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | build and local dev (`.env.local`) | API origin |

`NEXT_PUBLIC_*` values are inlined at build time, so the deploy workflow passes
`NEXT_PUBLIC_API_URL` to `opennextjs-cloudflare build` from a repository
variable of the same name.

The API's better-auth config must trust this origin (`trustedOrigins`), and its
Google OAuth client must include the API callback path
`/api/auth/callback/google` for the production API origin and the local API
origin.

Keep the web app and API on the same registrable domain so the session cookie
stays same-site and is sent with `credentials: "include"`.

## Requirements

- Node.js 24.x LTS (`engines.node: ">=24 <25"`, `.nvmrc` = `24`)
- npm 11
- TypeScript 7.0.2, the current stable release

## Develop

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at the API
npm run dev                  # port 3001 when the API holds 3000
```

Calls go to the API with cookies (`credentials: "include"`). The session gate
and all data fetching run in the browser. The API session cookie is host-only
on the API hostname, so the web server never sees it; keeping both apps on the
same registrable domain makes the cookie same-site. No token is stored in the
browser.

## Scripts

```bash
npm run types     # tsc --noEmit
npm run test      # node --test (zod validation unit tests)
npm run build     # next build
npm run gate      # types && test && build
npm run deploy    # opennextjs-cloudflare build && deploy
npm run preview   # opennextjs-cloudflare build && preview
```

Hooks live at the repository root in `lefthook.yml`: `commit-msg` runs
commitlint and `pre-push` runs the monorepo gate. Install them once with
`npm run hooks:install` from the root.

## Deploy

```bash
npm run deploy
```

Requires a Cloudflare API token (`CLOUDFLARE_API_TOKEN`) and account ID
(`CLOUDFLARE_ACCOUNT_ID`) with Workers and DNS access. `wrangler.jsonc` binds
the production web hostname; change the route there if the hostname changes.

CI: `.github/workflows/web-deploy.yml` at the repository root runs on pushes
that touch `web/**`. It needs the secret `CLOUDFLARE_API_TOKEN` and the
variables `CLOUDFLARE_ACCOUNT_ID` and `NEXT_PUBLIC_API_URL`.
