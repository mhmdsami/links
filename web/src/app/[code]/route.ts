import { getCloudflareContext } from "@opennextjs/cloudflare";

type RouteContext = { params: Promise<{ code: string }> };
type ApiBinding = { fetch: (request: Request) => Promise<Response> };

const PREVIEW_BOT =
  /facebookexternalhit|twitterbot|slackbot|discordbot|telegrambot|whatsapp|linkedinbot|pinterest|redditbot|applebot|googlebot|bingbot|embedly|quora link preview|skypeuripreview|mastodon|bluesky/i;

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]!,
  );
}

function previewPage(origin: string, code: string): Response {
  const safeCode = escapeHtml(code);
  const url = `${origin}/${encodeURIComponent(code)}`;
  const image = `${origin}/opengraph-image.png`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>links / ${safeCode}</title>
<meta name="description" content="A short link on links.">
<meta property="og:title" content="links / ${safeCode}">
<meta property="og:description" content="A short link on links.">
<meta property="og:site_name" content="links">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="links">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="links / ${safeCode}">
<meta name="twitter:description" content="A short link on links.">
<meta name="twitter:image" content="${image}">
<link rel="canonical" href="${url}">
</head>
<body><a href="${url}">links / ${safeCode}</a></body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}

async function fetchRedirect(
  request: Request,
  code: string,
): Promise<Response> {
  const path = `/api/redirect/${encodeURIComponent(code)}`;

  if (process.env.NODE_ENV === "development") {
    return fetch(`http://localhost:3000${path}`, { cache: "no-store" });
  }

  const { env } = getCloudflareContext();
  const api = (env as Record<string, unknown>).API as ApiBinding | undefined;
  const target = new URL(path, request.url);
  return api
    ? api.fetch(new Request(target))
    : fetch(target, { cache: "no-store" });
}

/**
 * Browsers get the redirect. Preview crawlers get links-owned OG tags so a
 * short link never renders the destination page's preview.
 */
export async function GET(request: Request, { params }: RouteContext) {
  const { code } = await params;
  const userAgent = request.headers.get("user-agent") ?? "";

  if (PREVIEW_BOT.test(userAgent)) {
    return previewPage(new URL(request.url).origin, code);
  }

  const response = await fetchRedirect(request, code);
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
