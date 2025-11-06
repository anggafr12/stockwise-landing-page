import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from "@/lib/http";

export type EventRow = {
  id: number;
  title: string;
  description: string | null;
  event_date: string | null;
  price: number;
  location: string | null;
  is_online: boolean;
  event_url: string | null; // sementara dipakai jg utk banner bila mau
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export async function listEvents(params?: { page?: number; limit?: number; q?: string; published?: boolean }) {
  return apiGet<{ rows: EventRow[]; page: number; limit: number; total: number }>("/api/admin/events", params);
}
export async function getEvent(id: number) {
  return apiGet<EventRow>(`/api/admin/events/${id}`);
}
export async function createEvent(payload: Partial<EventRow>) {
  return apiPost<EventRow>("/api/admin/events", payload);
}
export async function updateEvent(id: number, patch: Partial<EventRow>) {
  return apiPut<EventRow>(`/api/admin/events/${id}`, patch);
}
export async function deleteEvent(id: number) {
  return apiDelete<{ id: number }>(`/api/admin/events/${id}`);
}
export async function uploadEventBanner(id: number, file: File) {
  // return { url, path }
  return apiUpload<{ url: string; path: string }>(`/api/admin/events/${id}/banner`, file);
}
