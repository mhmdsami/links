import { getCloudflareContext } from "@opennextjs/cloudflare";

type RouteContext = { params: Promise<{ code: string }> };
type ApiBinding = { fetch: (request: Request) => Promise<Response> };

/**
 * Short-link redirects run on the web Worker because the API Worker only owns
 * /api/*. Call the API through a service binding so the subrequest does not
 * loop back into this Worker.
 */
export async function GET(request: Request, { params }: RouteContext) {
  const { code } = await params;
  const path = `/api/redirect/${encodeURIComponent(code)}`;

  let response: Response;
  if (process.env.NODE_ENV === "development") {
    response = await fetch(`http://localhost:3000${path}`, {
      cache: "no-store",
    });
  } else {
    const { env } = getCloudflareContext();
    const api = (env as Record<string, unknown>).API as ApiBinding | undefined;
    const target = new URL(path, request.url);
    response = api
      ? await api.fetch(new Request(target))
      : await fetch(target, { cache: "no-store" });
  }

  if (!response.ok) {
    return new Response("Link not found", { status: 404 });
  }

  const body = (await response.json()) as {
    success: boolean;
    data?: { url?: string };
  };
  const url = body.data?.url;

  if (!body.success || !url) {
    return new Response("Link not found", { status: 404 });
  }

  return Response.redirect(url, 302);
}
