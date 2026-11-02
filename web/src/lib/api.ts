import type { ApiEnvelope, Link } from "./types";

/**
 * Base URL of the links API. Empty means same origin, which is the production
 * setup: links.sam1.space/api/* routes to the API Worker.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

export function shortUrl(code: string): string {
  const origin = typeof window === "undefined" ? API_URL : window.location.origin;
  return `${origin}/${code}`;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const { body, headers, ...rest } = options;

  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...rest,
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(`Could not reach the links API at ${API_URL}.`, 0);
  }

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // Non-JSON error response (proxy, HTML error page, etc.).
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.message || `Request failed with status ${response.status}.`, response.status);
  }

  return payload ?? ({ success: true, message: "" } as ApiEnvelope<T>);
}

export const linksApi = {
  async list(): Promise<Link[]> {
    const result = await request<Link[]>("/api/admin/link/all");
    return result.data ?? [];
  },

  async create(input: { url: string; code: string }): Promise<Link | undefined> {
    const result = await request<Link[]>("/api/admin/link/create", { method: "POST", body: input });
    return Array.isArray(result.data) ? result.data[0] : (result.data as Link | undefined);
  },

  async update(code: string, url: string): Promise<void> {
    await request<unknown>(`/api/admin/link/${encodeURIComponent(code)}`, { method: "PATCH", body: { url } });
  },

  async remove(code: string): Promise<void> {
    await request<unknown>(`/api/admin/link/${encodeURIComponent(code)}`, { method: "DELETE" });
  },
};
