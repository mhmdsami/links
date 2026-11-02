import type { Env } from "../env";

/**
 * Dev-only auth bypass. Enabled only when LOCAL_PREVIEW=1 and the auth base
 * URL is a local HTTP origin, so it cannot activate in production where
 * BETTER_AUTH_URL is an HTTPS origin.
 */
export function isLocalPreview(env: Env): boolean {
  return (
    env.LOCAL_PREVIEW === "1" &&
    (env.BETTER_AUTH_URL ?? "").startsWith("http://localhost")
  );
}
