/**
 * Thin fetch wrapper for the AutoFlow REST API.
 * Throws an Error with the server's detail message on non-2xx responses.
 */

const API_BASE: string =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const { token, headers: extraHeaders, ...rest } = options ?? {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((extraHeaders as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, (body as { detail?: string }).detail ?? 'Request failed');
  }

  return res.json() as Promise<T>;
}
