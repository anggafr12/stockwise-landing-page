"use client";

type TierCode = 'FREE'|'PREMIUM'|'VIP';

export default function MembershipBadge({ code, name, color, className }: { code: TierCode; name?: string; color?: string | null; className?: string }) {
  const label = name ?? (code === 'FREE' ? 'Free' : code === 'PREMIUM' ? 'Premium' : 'VIP');
  const bg = color ?? (code === 'FREE' ? '#9CA3AF' : code === 'PREMIUM' ? '#3B82F6' : '#F59E0B');
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${className ?? ''}`}
      style={{ backgroundColor: bg, color: '#fff' }}
    >
      {label}
    </span>
  );
}

