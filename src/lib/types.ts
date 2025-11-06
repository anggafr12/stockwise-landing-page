export type MembershipTier = 'FREE' | 'PREMIUM' | 'VIP';
export type CourseLevel = 'beginer' | 'intermediate' | 'advanced';

export type UserMe = {
  id: number;
  name: string | null;
  email: string;
  username: string | null;
  role?: 'admin' | 'member' | 'guest' | string;
  is_verified: boolean;
  membership_tier?: MembershipTier;
  membership_expires_at?: string | null;
  discord_id?: string | null;
  phone?: string | null;
  address?: string | null;
  job?: string | null;
  batch?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Course = {
  id: number;
  title: string;
  description: string | null;
  price: number | string | null;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
  // unified view for membership gating
  min_tier: MembershipTier;
  thumbnail_url?: string | null;
  thumbnail_path?: string | null;
  course_level?: CourseLevel | null;
};

export type Paginated<T> = {
  page: number;
  limit: number;
  total: number;
  rowsCount: number;
  rows?: T[];
  data?: T[];
};

