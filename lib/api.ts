export type Meta = { total: number; page: number; limit: number; totalPages: number };

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/proxy/${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) window.location.href = '/login';
    const msg = data?.message;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Request failed');
  }
  return data as T;
}

export const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });
