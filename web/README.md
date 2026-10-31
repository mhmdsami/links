# links web

Web dashboard for the [links](https://github.com/mhmdsami/links) short-link API.
Next.js 16 (App Router) on Cloudflare Workers through OpenNext, better-auth
(Google), Tailwind CSS 4. The palette matches the Expo app (GitHub Dark).

The public redirect (`GET /:code`) is served by the **API**, never by this app.
This app only authenticates users and manages links.

## Env

| Variable | Where | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | build + local dev (`.env.local`) | `https://api.links.sam1.space` |

`NEXT_PUBLIC_*` values are inlined at build time, so the deploy workflow passes
`NEXT_PUBLIC_API_URL` to `opennextjs-cloudflare build` as an env var (GitHub
Actions repository variable `NEXT_PUBLIC_API_URL`).

The API's better-auth config must trust this origin (`trustedOrigins`), and its
Google OAuth client must include the **API** callback URL:

```
https://api.links.sam1.space/api/auth/callback/google
http://localhost:3000/api/auth/callback/google   # local API
```

Keep the web app and API on the same registrable domain (`links.sam1.space`,
`api.links.sam1.space`) so session cookies are same-site and sent with
`credentials: "include"`.

## Requirements

- Node.js 24.x LTS (`engines.node: ">=24 <25"`, `.nvmrc` = `24`)
- npm 11
- TypeScript 7.0.2 (no LTS; latest stable)

## Develop

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at the API
npm run dev                  # http://localhost:3001 (if the API holds 3000)
```

Calls go to the API with cookies (`credentials: "include"`). The session gate and
all data fetching run in the browser: the API's session cookie is host-only on
the API's subdomain, so the web server never sees it. Keep both apps on the same
registrable domain so the cookie is same-site. No token is stored in the
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

Hooks live at the repository root (`lefthook.yml`): `commit-msg` runs
commitlint, `pre-push` runs the monorepo gate. Install once with
`npm run hooks:install` at the root.

## Deploy

```bash
npm run deploy
```

Requires a Cloudflare API token (`CLOUDFLARE_API_TOKEN`) and account ID
(`CLOUDFLARE_ACCOUNT_ID`) with Workers + DNS access for `sam1.space`.
`wrangler.jsonc` binds the custom domain `links.sam1.space`; change the route if
the domain differs.

CI: `.github/workflows/web-deploy.yml` at the repo root runs on pushes that
touch `web/**` and needs the secrets `CLOUDFLARE_API_TOKEN` and the variables
`CLOUDFLARE_ACCOUNT_ID`, `NEXT_PUBLIC_API_URL`.
