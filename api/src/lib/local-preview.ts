/**
 * Dev-only auth bypass. Enabled only when LOCAL_PREVIEW=1 and the auth base
 * URL is a local HTTP origin, so it cannot activate in production where
 * BETTER_AUTH_URL is an HTTPS origin.
 */
export function isLocalPreview(): boolean {
  return (
    Bun.env.LOCAL_PREVIEW === "1" &&
    (Bun.env.BETTER_AUTH_URL ?? "").startsWith("http://localhost")
  );
}
