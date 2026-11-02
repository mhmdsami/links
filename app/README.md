# Links

Expo client for the links service. It manages a link collection from a phone
and signs in with Google through better-auth.

## Install

```sh
npm install
```

## Requirements

- Node.js 24.x LTS (`.nvmrc` = `24`)
- Expo SDK 58 (React Native 0.88.1, React 19.3.0)
- TypeScript 6.0.3, which the Expo SDK 58 template pins as `~6.0.3`;
  TypeScript 7 is not used here

## Development

Set up the Expo development environment, then start the dev server:

```sh
npm start
```

## Auth

The app signs in with Google through better-auth in `app/lib/auth-client.ts`.
The Expo client plugin opens the flow in `expo-web-browser` and returns through
the `links://` scheme. The session token is kept in SecureStore and sent to the
API as `Authorization: Bearer <token>`. Point the app at another API with
`EXPO_PUBLIC_API_URL`; otherwise it uses the production API origin configured in
`app/lib/auth-client.ts`.

## Checks

```sh
npm run types   # tsc --noEmit
npm run lint    # eslint
npm run gate    # types && lint
```

Hooks live at the repository root in `lefthook.yml`: `commit-msg` runs
commitlint and `pre-push` runs the monorepo gate. Install them once with
`npm run hooks:install` from the root.

## Android release build

`.github/workflows/app-android.yml` at the repository root builds a release APK
on pushes that touch `app/**` and on manual dispatch. It uses Node 24, Temurin
JDK 21, `npm ci`, `npx expo prebuild --platform android --clean`, then
`./gradlew assembleRelease`. Expo SDK 58 generates Gradle 9.4.1, which supports
JDK 21. The APK is uploaded as the `links-app-release-apk` artifact. No signing
keystore is configured, so the build uses Expo's default debug signing. Add a
release keystore before distributing.

The app uses npm (`package-lock.json`) and has no Bun lockfile.
