import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/http";

export type BatchRow = {
  id: number;
  code: string;
  name: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  is_active: boolean;
  created_at: string;
};

export async function listBatches(params?: {
  page?: number; limit?: number; q?: string; active?: boolean; sort?: string;
}) {
  return apiGet<{ page:number; limit:number; total:number; rows:BatchRow[] }>(
    "/api/admin/batches", params as any
  );
}

export async function createBatch(payload: Partial<BatchRow>) {
  return apiPost<BatchRow>("/api/admin/batches", payload);
}

export async function updateBatch(id:number, patch: Partial<BatchRow>) {
  return apiPut<BatchRow>(`/api/admin/batches/${id}`, patch);
}

export async function deleteBatch(id:number) {
  return apiDelete<void>(`/api/admin/batches/${id}`);
}

