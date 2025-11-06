// src/lib/public/courses.ts
import { apiGet } from "@/lib/http";

export type PublicCourse = {
  id: number;
  title: string;
  description?: string | null;
  price: number | null;
  thumbnail_url?: string | null;
  min_role: "guest" | "beginer" | "intermediate" | "advanced" | "admin";
  updated_at: string;
  created_at: string;
};

type ListResp = { rows: PublicCourse[]; page: number; limit: number; total: number; rowsCount: number };

export async function listPublishedCourses(params?: {
  page?: number;
  limit?: number;
  q?: string;
  min_role?: PublicCourse["min_role"] | null;
  sort?: string;
  course_level?: 'beginer'|'intermediate'|'advanced';
}): Promise<ListResp> {
  return apiGet<ListResp>("/api/public/courses", params as any);
}

export async function getCourseById(id: number) {
  try {
    return await apiGet<PublicCourse>(`/api/public/courses/${id}`);
  } catch (e) {
    throw e;
  }
}
