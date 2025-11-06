import { API_BASE, getToken } from "@/lib/http";

export type Me = {
  id: number;
  name: string | null;
  username: string;
  email: string;
  role: "guest" | "beginer" | "intermediate" | "advanced" | "admin";
  is_verified: boolean;
  discord_id?: string | null;
  phone?: string | null;
  address?: string | null;
  job?: string | null;
  batch?: string | null;
  membership_expires_at?: string | null;
};

async function req<T>(method: "GET" | "PUT", path: string, body?: any): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const getMe = async () => {
  const resp = await req<any>("GET", "/api/me");
  return resp;
};

export const updateMyProfile = (patch: Partial<Me>) =>
  req<{ ok: true; user: Me }>("PUT", "/api/app/profile", patch).then((r) => r.user);
