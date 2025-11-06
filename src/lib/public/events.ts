// src/lib/public/events.ts
import { apiGet, apiPost } from "@/lib/http";

export type PublicEvent = {
  id: number;
  title: string;
  description?: string | null;
  event_date: string | null;
  price: number | null;
  location?: string | null;
  is_online: boolean;
  event_url?: string | null;
  is_published: boolean;
  banner_url?: string | null;
  created_at: string;
  updated_at: string;
};

type ListResp = { rows: PublicEvent[]; page: number; limit: number; total: number };

export async function listPublishedEvents(params?: {
  page?: number;
  limit?: number;
  q?: string;
  is_online?: boolean;
  after?: string; // events after this datetime
  before?: string; // events before this datetime
  sort?: string; // e.g., updated_at.desc
}): Promise<ListResp> {
  return apiGet<ListResp>("/api/public/events", params as any);
}

export async function getEventById(id: number) {
  return apiGet<PublicEvent>(`/api/public/events/${id}`);
}

export async function createEventOrder(payload: {
  event_id: number;
  quantity: number;
  buyer: { name: string; email: string; phone: string; birth_date?: string; gender?: string; membership?: string };
}) {
  return apiPost<{ order_id: number }>("/api/public/event-orders", payload);
}

export async function createPaymentSession(payload: {
  order_id: number;
  gateway: "midtrans" | "xendit" | "dummy";
}) {
  return apiPost<{ redirect_url?: string; instructions?: string }>("/api/public/payments/session", payload);
}

