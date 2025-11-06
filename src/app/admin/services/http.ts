export const API_BASE =
  // Vite
  (import.meta as any)?.env?.VITE_API_BASE ||
  // fallback
  "http://localhost:5000";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const url = `${API_BASE}${path}`; // pastikan path diawali slash: "/api/..."
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} — ${text || url}`);
  }
  return res.json();
}
