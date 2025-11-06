import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/http";

export type MembershipPlan = {
  id: number;
  code: string;
  name: string;
  role_granted: "beginer" | "intermediate" | "advanced";
  price_idr: number;
  duration_days: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export async function listMembershipPlans(params?: {
  page?: number; limit?: number; q?: string; active?: boolean; sort?: string;
}) {
  return apiGet<{ page:number; limit:number; total:number; rows:MembershipPlan[] }>(
    "/api/admin/membership/plans", params as any
  );
}

export async function createMembershipPlan(payload: Partial<MembershipPlan>) {
  return apiPost<MembershipPlan>("/api/admin/membership/plans", payload);
}

export async function updateMembershipPlan(id:number, patch: Partial<MembershipPlan>) {
  return apiPut<MembershipPlan>(`/api/admin/membership/plans/${id}`, patch);
}

export async function deleteMembershipPlan(id:number) {
  return apiDelete<void>(`/api/admin/membership/plans/${id}`);
}

