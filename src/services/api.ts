import { apiGet } from '@/lib/http';

export type CourseLevel = 'beginer' | 'intermediate' | 'advanced';

export async function fetchCourses(level?: CourseLevel) {
  const qs = level ? `?level=${encodeURIComponent(level)}` : '';
  const res: any = await apiGet(`/api/public/courses${qs}`);
  const items = (res?.items ?? res?.rows ?? res?.data ?? res) || [];
  const total = res?.total ?? res?.rowsCount ?? (Array.isArray(items) ? items.length : 0);
  return { items, total };
}

