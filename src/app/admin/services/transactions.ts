import { apiGet } from "@/lib/http";

export type EventPurchaseRow = {
  id: number; user_id: number; event_id: number; amount: number;
  payment_status: "PENDING"|"PAID"|"FAILED";
  payment_gateway: string | null; transaction_id: string | null; purchased_at: string;
  users?: any; events?: any;
};

export async function listEventPurchases() {
  return apiGet<EventPurchaseRow[]>("/api/admin/transactions/events");
}
