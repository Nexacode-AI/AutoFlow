/**
 * Thin fetch wrapper for the AutoFlow REST API.
 * Automatically reads the JWT token from dev's auth storage.
 * Throws ApiError with the server's detail message on non-2xx responses.
 */
import { getToken } from '@/lib/auth/storage';

const API_BASE: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

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
  options?: RequestInit,
): Promise<T> {
  const { headers: extraHeaders, ...rest } = options ?? {};
  const token = getToken();

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
