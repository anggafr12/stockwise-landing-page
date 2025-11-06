import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from "@/lib/http";

export type CourseRow = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  is_published: boolean;
  min_role: string;
  thumbnail_url?: string | null;
  thumbnail_path?: string | null;
  created_at: string;
  updated_at: string;
};

export type CourseListResponse = {
  rows: CourseRow[];
  page: number;
  limit: number;
  total: number;
};

export type VideoRow = {
  id: number;
  course_id: number;
  title: string;
  video_url: string | null;
  storage_path?: string | null;
  order_index: number;
  duration_seconds?: number | null;
  size?: number | null;
  mime?: string | null;
  created_at?: string;
  updated_at?: string;
};

const unwrapCourse = (payload: any): CourseRow => {
  if (!payload) return payload;
  if (payload.row) return payload.row as CourseRow;
  if (payload.data) {
    if (Array.isArray(payload.data)) return payload.data[0] as CourseRow;
    return payload.data as CourseRow;
  }
  return payload as CourseRow;
};

const unwrapVideo = (payload: any): VideoRow => {
  if (!payload) return payload;
  if (payload.row) return payload.row as VideoRow;
  if (payload.data) {
    if (Array.isArray(payload.data)) return payload.data[0] as VideoRow;
    return payload.data as VideoRow;
  }
  return payload as VideoRow;
};

const unwrapVideoList = (payload: any): VideoRow[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as VideoRow[];
  if (payload.rows && Array.isArray(payload.rows)) return payload.rows as VideoRow[];
  if (payload.data && Array.isArray(payload.data)) return payload.data as VideoRow[];
  return [];
};

export async function listCourses(params?: {
  page?: number;
  limit?: number;
  q?: string;
  published?: boolean;
}) {
  return apiGet<CourseListResponse>("/api/admin/courses", params);
}

export async function createCourse(
  payload: Omit<Partial<CourseRow>, "id" | "created_at" | "updated_at">
) {
  const response = await apiPost<
    CourseRow | { row?: CourseRow; data?: CourseRow; ok?: boolean }
  >("/api/admin/courses", payload);
  return unwrapCourse(response);
}

export async function updateCourse(id: number, patch: Partial<CourseRow>) {
  const response = await apiPut<
    CourseRow | { row?: CourseRow; data?: CourseRow; ok?: boolean }
  >(`/api/admin/courses/${id}`, patch);
  return unwrapCourse(response);
}

export async function deleteCourse(id: number) {
  return apiDelete<{ id: number }>(`/api/admin/courses/${id}`);
}

export async function uploadCourseThumb(id: number, file: File) {
  return apiUpload<{ url: string; path: string }>(
    `/api/admin/courses/${id}/thumbnail`,
    file
  );
}

export async function listVideos(courseId: number) {
  const response = await apiGet<
    VideoRow[] | { data?: VideoRow[]; rows?: VideoRow[]; ok?: boolean }
  >(`/api/admin/courses/${courseId}/videos`);
  return unwrapVideoList(response);
}

export async function createVideo(
  courseId: number,
  payload: Record<string, unknown>
) {
  const response = await apiPost<
    VideoRow | { data?: VideoRow; row?: VideoRow; ok?: boolean }
  >(`/api/admin/courses/${courseId}/videos`, payload);
  return unwrapVideo(response);
}

export async function updateVideo(id: number, patch: Record<string, unknown>) {
  const response = await apiPut<
    VideoRow | { data?: VideoRow; row?: VideoRow; ok?: boolean }
  >(`/api/admin/videos/${id}`, patch);
  return unwrapVideo(response);
}

export async function deleteVideo(id: number) {
  return apiDelete<{ id: number }>(`/api/admin/videos/${id}`);
}

export async function uploadVideoSource(id: number, file: File) {
  return apiUpload<{
    url: string | null;
    path: string;
    duration_seconds: number | null;
    size: number | null;
    mime: string | null;
  }>(
    `/api/admin/videos/${id}/upload`,
    file
  );
}
