import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { SessionPayload } from "./types";

type ApiBinding = { fetch: (request: Request) => Promise<Response> };

/**
 * Reads the better-auth session from the API Worker. In production the web
 * Worker uses a service binding; in development it calls the local Worker.
 */
export async function getSession(cookie: string): Promise<SessionPayload> {
  if (!cookie) return null;

  let response: Response;
  if (process.env.NODE_ENV === "development") {
    response = await fetch("http://localhost:3000/api/auth/get-session", {
      headers: { cookie },
      cache: "no-store",
    });
  } else {
    const { env } = getCloudflareContext();
    const api = (env as Record<string, unknown>).API as ApiBinding | undefined;
    const request = new Request("https://links.sam1.space/api/auth/get-session", {
      headers: { cookie },
    });
    response = api
      ? await api.fetch(request)
      : await fetch(request, { cache: "no-store" });
  }

  if (!response.ok) return null;

  const payload = (await response.json()) as SessionPayload;
  return payload?.user ? payload : null;
}
