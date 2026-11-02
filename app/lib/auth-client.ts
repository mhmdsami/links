import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

/**
 * Base URL of the links API. Override with EXPO_PUBLIC_API_URL for local dev.
 */
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "https://links-api.sam1.space"
).replace(/\/+$/, "");

/**
 * Dev-only auth bypass. Enabled only with an explicit flag and an HTTP API
 * origin, so a production build using HTTPS never activates it.
 */
export const LOCAL_PREVIEW =
  process.env.EXPO_PUBLIC_LOCAL_PREVIEW === "1" &&
  API_URL.startsWith("http://");

/**
 * better-auth client for the native app.
 *
 * The Expo plugin opens Google in `expo-web-browser`, receives the deep-link
 * callback on the `links://` scheme, and persists the session cookie in
 * SecureStore.
 */
export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({
      scheme: "links",
      storagePrefix: "links",
      storage: SecureStore,
    }),
  ],
});
