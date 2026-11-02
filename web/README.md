# links web

Next.js 16 dashboard on Cloudflare Workers via OpenNext. It shares a hostname
with the API Worker: `/api/*` is routed to the API, everything else to this
Worker, including short-link redirects.

## Requirements

- Node.js 24.x LTS (`engines.node: ">=24 <25"`, `.nvmrc` = `24`)
- Bun 1.4.4 for dependencies and scripts
- Wrangler 4.156.0
- TypeScript 7.0.2

## Develop

```bash
bun install
cp .env.example .env.development.local   # optional local preview flag
bun run dev                  # port 3001 when the API holds 3000
```

In development, `next.config.ts` rewrites `/api/*` to the API Worker on port
3000, so browser requests stay same-origin.

`NEXT_PUBLIC_LOCAL_PREVIEW=1` renders the dashboard as `dev@localhost` and
skips Google sign-in. It is not set in CI or production.

## Short links

`src/app/[code]/route.ts` handles `GET /:code`. It calls
`/api/redirect/:code` through the `API` service binding, which records the
click, then returns a 302 to the destination. A service binding avoids a
same-zone subrequest looping back into this Worker.

## Scripts

```bash
bun run types     # tsc --noEmit
bun run test      # node --test (zod validation unit tests)
bun run build     # next build
bun run gate      # types && test && build
bun run deploy    # opennextjs-cloudflare build && deploy
bun run preview   # opennextjs-cloudflare build && preview
```

Hooks live at the repository root in `lefthook.yml`. Install them once with
`bun run hooks:install` from the root.

## Deploy

```bash
bun run deploy
```

Requires a Cloudflare API token (`CLOUDFLARE_API_TOKEN`) and account ID
(`CLOUDFLARE_ACCOUNT_ID`) with Workers and DNS access.

`wrangler.jsonc` routes `links.sam1.space/*` to this Worker. The API Worker
owns the more specific `links.sam1.space/api/*` route.

CI: `.github/workflows/web-deploy.yml` runs on pushes that touch `web/**`.
