import type { ApiEnvelope, Link } from "./types";

/**
 * Base URL of the links API (Hono on Bun). The short-link redirect lives there
 * too: GET `${API_URL}/:code`.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function shortUrl(code: string): string {
  return `${API_URL}/${code}`;
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
      credentials: "include",
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
    const result = await request<Link[]>("/admin/link/all");
    return result.data ?? [];
  },

  async create(input: { url: string; code: string }): Promise<Link | undefined> {
    const result = await request<Link[]>("/admin/link/create", { method: "POST", body: input });
    return Array.isArray(result.data) ? result.data[0] : (result.data as Link | undefined);
  },

  async update(code: string, url: string): Promise<void> {
    await request<unknown>(`/admin/link/${encodeURIComponent(code)}`, { method: "PATCH", body: { url } });
  },

  async remove(code: string): Promise<void> {
    await request<unknown>(`/admin/link/${encodeURIComponent(code)}`, { method: "DELETE" });
  },
};
