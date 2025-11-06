import type { MembershipTier } from './types';

export const tierRank = (t: MembershipTier) => (t === 'VIP' ? 3 : t === 'PREMIUM' ? 2 : 1);
export const canAccessCourse = (userTier: MembershipTier, min: MembershipTier) =>
  tierRank(userTier) >= tierRank(min);

export function roleToTier(role?: string | null): MembershipTier {
  const r = String(role || '').toLowerCase();
  if (r === 'advanced' || r === 'admin') return 'VIP';
  if (r === 'beginer' || r === 'intermediate' || r === 'member' || r === 'premium') return 'PREMIUM';
  return 'FREE';
}

export function minRoleToTier(minRole?: string | null): MembershipTier {
  const r = String(minRole || '').toLowerCase();
  if (r === 'advanced') return 'VIP';
  if (r === 'beginer' || r === 'intermediate' || r === 'premium') return 'PREMIUM';
  return 'FREE';
}

