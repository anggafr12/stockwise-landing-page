"use client";

import { Link, useNavigate } from "react-router-dom";
import type { Course, MembershipTier, CourseLevel } from "@/lib/types";
import { canAccessCourse } from "@/lib/tier";
import MembershipBadge from "@/components/MembershipBadge";

const levelLabel: Record<CourseLevel, string> = {
  beginer: "Beginer",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function CourseCard({
  course,
  userTier,
  onClick,
}: {
  course: Course & { min_role?: string };
  userTier?: MembershipTier;
  onClick?: () => void;
}) {
  const nav = useNavigate();
  const fallback = "/course-thumbnail.jpg";
  const handleClick = () => {
    if (onClick) return onClick();
    nav(`/lms-main/course/${course.id}`);
  };

  const minTier: MembershipTier = (course as any).min_tier || ((): MembershipTier => {
    const r = String((course as any).min_role || '').toLowerCase();
    if (r === 'advanced') return 'VIP';
    if (r === 'beginer' || r === 'intermediate') return 'PREMIUM';
    return 'FREE';
  })();
  const allowed = userTier ? canAccessCourse(userTier, minTier) : true;
  const priceNum = typeof course.price === 'string' ? Number(course.price) : (course.price || 0);

  return (
    <Link
      to={`/lms-main/course/${course.id}`}
      className="block group text-left rounded-lg overflow-hidden border border-[#1E263A] bg-[#0F1629] hover:border-[#3B82F6]/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="relative aspect-video bg-[#0A0F1E] overflow-hidden">
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img
          src={course.thumbnail_url || fallback}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallback; }}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {course.course_level && (
            <span className="text-[10px] px-2 py-1 rounded bg-[#1E263A] text-gray-300">
              {levelLabel[course.course_level as CourseLevel]}
            </span>
          )}
          <div className="inline-flex items-center gap-1">
            <span className="text-[10px] text-gray-400">Min:</span>
            <MembershipBadge
              code={minTier}
              name={(course as any).min_tier_name}
              color={(course as any).min_tier_badge_color}
            />
          </div>
        </div>
        <h4 className="font-medium text-white mb-2 line-clamp-2">{course.title}</h4>
        <div className="text-sm text-gray-400 flex items-center justify-between">
          <span>{priceNum > 0 ? `Rp ${Intl.NumberFormat('id-ID').format(priceNum)}` : 'Gratis'}</span>
          {allowed ? (
            <span className="text-xs bg-[#3B82F6] group-hover:bg-[#2563EB] px-3 py-1 rounded">Lihat Detail</span>
          ) : (
            <button onClick={(e) => { e.preventDefault(); nav('/membership'); }} className="text-xs bg-[#a38922] hover:bg-[#8c731c] px-3 py-1 rounded">
              Upgrade {minTier}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
