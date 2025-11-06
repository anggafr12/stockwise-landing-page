import { apiGet, apiPut } from "@/lib/http";

export type UserRow = {
  id: number;
  name: string | null;
  email: string;
  username: string | null;
  role: "admin" | "member" | "guest";
  is_verified: boolean;
  membership_tier?: "FREE" | "PREMIUM" | "VIP";
  membership_expires_at?: string | null;
  created_at: string;
  updated_at: string | null;
};

export async function listUsers(params?: {
  page?: number;
  limit?: number;
  q?: string;
  role?: UserRow["role"];
  verified?: boolean;
  sort_by?: "created_at" | "name" | "email" | "role" | "is_verified" | "updated_at";
  sort_dir?: "asc" | "desc";
}) {
  const payload: Record<string, any> = { ...params };
  if (typeof params?.verified === "boolean") {
    payload.verified = params.verified ? "true" : "false";
  }
  return apiGet<{ page: number; limit: number; total: number; rows: UserRow[] }>(
    "/api/admin/users",
    payload
  );
}

export async function updateUser(id: number, patch: Partial<UserRow>) {
  return apiPut<UserRow>(`/api/admin/users/${id}`, patch);
}
