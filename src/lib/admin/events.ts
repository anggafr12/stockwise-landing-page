// src/lib/admin/events.ts
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from "@/lib/http";

export type EventRow = {
  id: number;
  title: string;
  description: string | null;
  event_date: string | null; // ISO string from backend (or "YYYY-MM-DD HH:mm:ss")
  price: number | null;
  location: string | null;
  is_online: boolean;
  event_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  banner_url?: string | null;
};

type ListResponse = {
  rows: EventRow[];
  page: number;
  limit: number;
  total: number;
};

function unwrap<T = any>(payload: any): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as any).data as T;
  }
  return payload as T;
}

export async function listEvents(params?: {
  page?: number;
  limit?: number;
  q?: string;
  published?: boolean;
  is_online?: boolean;
  sort?: string;
}): Promise<ListResponse> {
  const resp = await apiGet<any>("/api/admin/events", params as any);
  const data = unwrap<any>(resp);
  if (data && typeof data === "object" && "rows" in data) {
    return data as ListResponse;
  }
  // Fallback shapes
  if (Array.isArray(data)) {
    return { rows: data as EventRow[], page: params?.page ?? 1, limit: params?.limit ?? 20, total: (data as any[]).length };
  }
  return { rows: [], page: 1, limit: params?.limit ?? 20, total: 0 };
}

export async function createEvent(payload: Partial<EventRow>) {
  const resp = await apiPost<any>("/api/admin/events", payload);
  return unwrap<EventRow>(resp);
}

export async function updateEvent(id: number, patch: Partial<EventRow>) {
  const resp = await apiPut<any>(`/api/admin/events/${id}`, patch);
  return unwrap<EventRow>(resp);
}

export async function deleteEvent(id: number) {
  const resp = await apiDelete<any>(`/api/admin/events/${id}`);
  return unwrap<{ id: number }>(resp);
}

export async function uploadEventBanner(id: number, file: File) {
  const resp = await apiUpload<any>(`/api/admin/events/${id}/banner`, file);
  return unwrap<{ url: string; path: string }>(resp);
}

