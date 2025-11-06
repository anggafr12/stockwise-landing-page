// src/lib/api/users.ts
import { apiGet, apiPut, apiDelete } from "@/lib/http";

export type UserRow = {
  id: number;
  name: string | null;
  username: string | null;
  email: string;
  role: "admin" | "advanced" | "intermediate" | "beginer" | "guest";
  is_verified: boolean;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
  updated_at: string | null;
};

export type ListUsersResp = {
  rows: UserRow[];
  page: number;
  limit: number;
  total: number;
};

function normalizeListUsersResp(raw: any): ListUsersResp {
  if (Array.isArray(raw)) {
    return {
      rows: raw,
      page: 1,
      limit: raw.length,
      total: raw.length,
    };
  }

  if (raw && Array.isArray(raw.rows)) {
    const rows = raw.rows as UserRow[];
    const page = Number(raw.page ?? 1);
    const limit = Number(raw.limit ?? rows.length ?? 50);
    const total = Number(raw.total ?? rows.length ?? 0);
    return {
      rows,
      page: Number.isFinite(page) ? page : 1,
      limit: Number.isFinite(limit) ? limit : rows.length ?? 0,
      total: Number.isFinite(total) ? total : rows.length ?? 0,
    };
  }

  return { rows: [], page: 1, limit: 0, total: 0 };
}

export async function listUsers(params?: {
  page?: number;
  limit?: number;
  q?: string;
  role?: UserRow["role"] | "all";
  verified?: "all" | "true" | "false";
}) {
  const raw = await apiGet<any>("/api/admin/users", params);
  return normalizeListUsersResp(raw);
}

export async function updateUser(id: number, patch: Partial<UserRow>) {
  return apiPut<UserRow>(`/api/admin/users/${id}`, patch);
}

export async function deleteUser(id: number) {
  return apiDelete<{ id: number }>(`/api/admin/users/${id}`);
}

export async function verifyUser(id: number, flag: boolean) {
  return updateUser(id, { is_verified: flag });
}

export async function setUserRole(id: number, role: UserRow["role"]) {
  return updateUser(id, { role });
}
