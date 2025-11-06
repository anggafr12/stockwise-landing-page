// src/lib/http.ts
export const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE || "";

// Auth token helpers (app-wide)
export function setToken(token: string) {
  try {
    localStorage.setItem("ACCESS_TOKEN", token);
  } catch {}
}
export function getToken(): string | null {
  try {
    return localStorage.getItem("ACCESS_TOKEN");
  } catch {
    return null;
  }
}
export function clearToken() {
  try {
    localStorage.removeItem("ACCESS_TOKEN");
  } catch {}
}

function toQuery(params?: Record<string, any>) {
  if (!params) return "";
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: any,
  headers?: HeadersInit
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const h: Record<string, string> = { ...(headers as any) };
  const t = getToken();
  if (t) h["Authorization"] = `Bearer ${t}`;

  const init: RequestInit = { method, headers: h, credentials: 'include' };

  if (body && !(body instanceof FormData)) {
    h["Content-Type"] = "application/json"; // preserve other headers
    init.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    init.body = body; // browser sets multipart boundary
  }

  if (import.meta.env.DEV) {
    console.debug("[HTTP]", method, url, body instanceof FormData ? "[FormData]" : body);
  }

  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} — ${text || url}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string, params?: Record<string, any>) {
  return request<T>("GET", `${path}${toQuery(params)}`);
}
export async function apiPost<T>(path: string, payload?: any) {
  return request<T>("POST", path, payload);
}
export async function apiPut<T>(path: string, payload?: any) {
  return request<T>("PUT", path, payload);
}
export async function apiPatch<T>(path: string, payload?: any) {
  return request<T>("PATCH", path, payload);
}
export async function apiDelete<T>(path: string, payload?: any) {
  return request<T>("DELETE", path, payload);
}
export async function apiUpload<T>(path: string, file: File, extra?: Record<string, any>) {
  const fd = new FormData();
  fd.append("file", file);
  if (extra) Object.entries(extra).forEach(([k, v]) => fd.append(k, String(v)));
  return request<T>("POST", path, fd);
}
