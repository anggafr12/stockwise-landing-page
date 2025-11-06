import { apiGet, apiPut } from "@/lib/http";

export type Me = {
  id: number;
  username: string;
  email: string;
  name: string | null;
  role: "guest" | "beginer" | "intermediate" | "advanced" | "admin";
  referred_by: string | null;
  referral_code: string | null;
  discord_id: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export async function getMe(): Promise<any> {
  const resp = await apiGet<any>("/api/me");
  // Support both { user, active_membership } and raw user for backward-compat
  return typeof resp === 'object' && resp && 'user' in resp ? resp : { user: resp, active_membership: null };
}

export type AppCourse = {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
  is_published: boolean;
  min_role: "free" | "beginer" | "intermediate" | "advanced";
  thumbnail_url?: string | null;
  created_at: string;
  updated_at: string;
};

export function listAppCourses(params?: Record<string, any>) {
  return apiGet<{ page: number; limit: number; total: number; rowsCount: number; rows: AppCourse[] }>(
    "/api/app/courses",
    params
  );
}

export function listPublicCourses(params?: Record<string, any>) {
  return apiGet<{ page: number; limit: number; total: number; rows: AppCourse[] }>("/api/public/courses", params);
}

export function listPublicEvents(params?: Record<string, any>) {
  return apiGet<{ page: number; limit: number; total: number; rows: any[] }>("/api/public/events", params);
}

export type MyEnrollment = {
  id: number;
  payment_status: string;
  enrolled_at: string;
  course: { id: number; title: string; price: number | null; min_role: string };
};

export function listMyEnrollments() {
  return apiGet<{ rows: MyEnrollment[]; total: number }>("/api/app/enrollments");
}

export type MyTicket = {
  id: number;
  amount: number | null;
  payment_status: string;
  purchased_at: string;
  event: {
    id: number;
    title: string;
    event_date: string | null;
    location: string | null;
    is_online: boolean;
    price: number | null;
  };
};

export function listMyTickets() {
  return apiGet<{ rows: MyTicket[]; total: number }>("/api/app/tickets");
}

export function updateProfile(patch: Partial<Pick<Me, "name" | "username" | "discord_id">>) {
  return apiPut<{ ok: true; user: Me }>("/api/app/profile", patch);
}

export function updateMe(patch: any) {
  return apiPut("/api/app/me", patch);
}

export function changePassword(payload: { old_password: string; new_password: string }) {
  return apiPut<{ ok: true }>("/api/app/password", payload);
}
