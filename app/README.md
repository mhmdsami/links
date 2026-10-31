# Linx

Client for [links](https://github.com/mhmdsami/links) to manage a link collection. Built with [Expo](https://expo.dev)

<img src="https://github.com/user-attachments/assets/635b911b-1857-4d65-a53a-eaf2bd873703" alt="config screen" width="32%" />
<img src="https://github.com/user-attachments/assets/1cd6f972-b493-42bc-9ae0-0e085197ae06" alt="create screen" width="32%" />
<img src="https://github.com/user-attachments/assets/9645da4c-2500-4dc3-b7db-012bf1cc25fe" alt="links screen" width="32%" />

### To install dependencies:

```sh
npm install
```

### Requirements

- Node.js 24.x LTS (`.nvmrc` = `24`)
- Expo SDK 58 (React Native 0.88.1, React 19.3.0)
- TypeScript 6.0.3 (Expo SDK 58 pins `~6.0.3`; TypeScript 7 is not used here)

### Development setup:

- Set up the [development environment](https://docs.expo.dev/get-started/set-up-your-environment/) for running expo

- Start the devlopment server

```sh
npm start
```

### Checks

```sh
npm run types   # tsc --noEmit
npm run lint    # eslint
npm run gate    # types && lint
```

Hooks live at the repository root (`lefthook.yml`): `commit-msg` runs
commitlint, `pre-push` runs the monorepo gate. Install once with
`npm run hooks:install` at the root.

### Android release build

`.github/workflows/app-android.yml` at the repo root builds a release APK on
pushes that touch `app/**` (and on manual dispatch): Node 24, Temurin JDK 21,
`npm ci`, `npx expo prebuild --platform android --clean`, then
`./gradlew assembleRelease`. Expo SDK 58 generates Gradle 9.4.1, which supports
JDK 21. The APK is uploaded as the `links-app-release-apk` artifact. No signing
keystore is configured, so Expo's default debug signing is used — add a release
keystore before distributing.

The app uses npm (`package-lock.json`); there is no Bun lockfile in `app/`.
