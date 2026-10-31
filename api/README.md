# Links

API to manage a link collection. Built with Hono, Bun, Drizzle, and SQLite.
Public link redirects live here: `GET /:code`. The dashboard clients (web, Expo)
authenticate with better-auth (Google).

### To install dependencies:

```sh
bun install
```

### Development setup:

- Create a `.env` file in the root of the project (use `.env.example` as a template)

```sh
cp .env.example .env
```

- Run the migrations

```sh
bun run migrate
```

- Start the server

```sh
bun run dev
```

open http://localhost:3000

### Auth

`/api/auth/*` is handled by better-auth (Google social provider). The admin
routes under `/admin/link/*` require a valid session cookie. The canonical
`src/lib/auth.ts` and the auth tables live on the server; `docs/auth-wiring.patch`
contains the two route changes needed to wire it up.

Env:

- `BETTER_AUTH_URL`: public base URL of this API, e.g. `https://api.links.sam1.space`
- `BETTER_AUTH_SECRET`: long random string
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth web client
- `TRUSTED_ORIGINS`: comma-separated browser origins allowed to call the API
  cross-origin (CORS with credentials + better-auth trusted origins), e.g.
  `https://links.sam1.space`

Google Cloud Console redirect URI:
`https://api.links.sam1.space/api/auth/callback/google` (plus
`http://localhost:3000/api/auth/callback/google` for local development).

### Scripts

```sh
bun run types   # tsc --noEmit
bun run test    # bun test
bun run gate    # types && test
```

Hooks live at the repository root (`lefthook.yml`): `commit-msg` runs
commitlint, `pre-push` runs the full monorepo gate. Install them once with
`npm run hooks:install` at the root.
