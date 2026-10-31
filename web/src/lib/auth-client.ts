import { createAuthClient } from "better-auth/react";
import { API_URL } from "./api";

/**
 * better-auth client bound to the API's base URL. Session cookies are sent
 * cross-origin (`credentials: "include"`), so the API must allow this origin
 * via `trustedOrigins` in its better-auth config.
 */
export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: { credentials: "include" },
});
