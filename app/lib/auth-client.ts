import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

/**
 * Base URL of the links API. Override with EXPO_PUBLIC_API_URL for local dev.
 */
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "https://api.links.sam1.space"
).replace(/\/+$/, "");

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
