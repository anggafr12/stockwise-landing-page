import { apiPost } from "@/lib/http";
export async function seedData() {
  return apiPost<{ message: string }>("/api/admin/seed", {});
}
