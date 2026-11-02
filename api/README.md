# links API

API for managing a link collection. Built with Hono, Bun, Drizzle, and SQLite.
Public redirects are served here at `GET /:code`. The web and Expo clients
authenticate with better-auth using Google.

## Requirements

- Bun 1.4.x (currently 1.4.4). Bun has no LTS channel, so the major is pinned in
  `engines.bun` and CI.
- Node.js 24.x LTS for tooling (`engines.node: ">=24 <25"`).
- TypeScript 7.0.2, the current stable release.
- Hono 4.13, Drizzle ORM 0.45 / Kit 0.31, better-auth 1.7, Zod 3.25.

## Install

```sh
bun install
```

## Development

Create a `.env` file from the example:

```sh
cp .env.example .env
```

Run the migrations, then start the server:

```sh
bun run migrate
bun run dev
```

The dev server listens on port 3000.

## Auth

`/api/auth/*` is handled by better-auth with the Google provider. The admin
routes under `/admin/link/*` require either a session cookie or an
`Authorization: Bearer <session-token>` header. The native app uses the bearer
plugin. The canonical `src/lib/auth.ts` and the auth tables live on the server;
`docs/auth-wiring.patch` contains the route changes needed to wire them up.

Environment:

- `BETTER_AUTH_URL`: public base URL of this API.
- `BETTER_AUTH_SECRET`: long random string.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth web client.
- `TRUSTED_ORIGINS`: comma-separated origins allowed to call the API
  cross-origin, covering CORS with credentials and better-auth trusted origins.
  Include the web origin and the app scheme `linx://`.

Register the `/api/auth/callback/google` path on the production API origin as a
Google redirect URI, and add the local API origin for development.

## Scripts

```sh
bun run types   # tsc --noEmit
bun run test    # bun test
bun run gate    # types && test
```

Hooks live at the repository root in `lefthook.yml`: `commit-msg` runs
commitlint and `pre-push` runs the full monorepo gate. Install them once with
`npm run hooks:install` from the root.
