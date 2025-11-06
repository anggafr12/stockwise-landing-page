import { apiGet, apiPost, apiPut, apiUpload } from "@/lib/http";

export type CourseRow = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  is_published: boolean;
  min_tier: "FREE" | "PREMIUM" | "VIP";
  course_level?: "beginer" | "intermediate" | "advanced" | null;
  created_at: string;
  updated_at: string | null;
  thumbnail_url?: string | null;
};

export async function listCourses(params?: {
  page?: number;
  limit?: number;
  q?: string;
  published?: boolean;
  min_tier?: CourseRow["min_tier"];
  sort_by?: "created_at" | "price" | "title" | "updated_at";
  sort_dir?: "asc" | "desc";
}) {
  return apiGet<{ page: number; limit: number; total: number; rows: CourseRow[] }>(
    "/api/admin/courses",
    params
  );
}

function unwrapCourse(payload: any): CourseRow {
  if (!payload) return payload;
  if (payload.id) return payload as CourseRow;
  if (payload.row) return payload.row as CourseRow;
  if (Array.isArray(payload.data)) return payload.data[0] as CourseRow;
  if (payload.data) return payload.data as CourseRow;
  return payload as CourseRow;
}

export async function createCourse(
  payload: Partial<CourseRow> & { title: string; price?: number; min_tier: CourseRow["min_tier"]; course_level?: "beginer"|"intermediate"|"advanced" }
) {
  const res = await apiPost<CourseRow | { row?: CourseRow; data?: CourseRow }>(
    "/api/admin/courses",
    payload
  );
  return unwrapCourse(res);
}

export async function updateCourse(id: number, patch: Partial<CourseRow>) {
  return apiPut<CourseRow>(`/api/admin/courses/${id}`, patch);
}

export async function uploadCourseThumb(id: number, file: File) {
  return apiUpload<{ url: string; path: string }>(`/api/admin/courses/${id}/thumbnail`, file);
}
