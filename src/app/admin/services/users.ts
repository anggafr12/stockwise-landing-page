import { apiGet, apiPut } from "@/lib/http";

export type UserRow = {
  id: number; email: string; username: string | null; name: string | null;
  role: "admin"|"beginer"|"intermediate"|"advanced"|"guest";
  is_verified: boolean; created_at: string; updated_at: string;
};

export async function listUsers(params?: { page?: number; limit?: number; q?: string }) {
  return apiGet<{ rows: UserRow[]; page: number; limit: number; total: number }>("/api/admin/users", params);
}
export async function updateUser(id: number, patch: Partial<UserRow>) {
  return apiPut<UserRow>(`/api/admin/users/${id}`, patch);
}
