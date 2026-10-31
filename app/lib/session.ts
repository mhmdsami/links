import { STORAGE_KEYS } from "@/constants";
import * as SecureStore from "expo-secure-store";
import { authClient } from "./auth-client";

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * The bearer token is the signed better-auth session cookie value. Native
 * clients cannot rely on host-only cookies, so the API's bearer plugin
 * accepts this value as `Authorization: Bearer <token>`.
 */
export function parseSessionToken(cookieHeader: string): string | null {
  for (const name of SESSION_COOKIE_NAMES) {
    const match = cookieHeader.match(
      new RegExp(`(?:^|;\\s*)${escapeRegExp(name)}=([^;]+)`),
    );
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }
  return null;
}

/**
 * Copies the session token from the expo client's SecureStore cookie jar into
 * our own key so screens can read it synchronously.
 */
export async function persistSessionToken(): Promise<string | null> {
  const cookies = await authClient.getCookie();
  const token = parseSessionToken(cookies);
  if (token) {
    await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token);
  }
  return token;
}

export function getSessionToken(): string | null {
  return SecureStore.getItem(STORAGE_KEYS.TOKEN);
}

export function isSignedIn(): boolean {
  return !!getSessionToken();
}

export async function signOut() {
  try {
    await authClient.signOut();
  } catch (error) {
    console.error(error);
  }
  await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
}

/**
 * Drops credentials from the pre-better-auth app (domain + ADMIN_TOKEN) so a
 * stale token is never sent to the session-protected API.
 */
export async function clearLegacyAuthStorage() {
  const legacyDomain = SecureStore.getItem(STORAGE_KEYS.DOMAIN);
  if (legacyDomain) {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.DOMAIN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
  }
}
