import { apiGet, apiPost } from "@/lib/http";

export function listPlans() {
  return apiGet<{ rows: any[] }>("/api/app/membership/plans");
}

export function checkoutMembership(plan_id: number) {
  return apiPost<{ invoice: any; transaction: any }>("/api/app/membership/checkout", { plan_id });
}

export function getActiveMembership() {
  return apiGet<{ active: any }>("/api/app/membership/active");
}

