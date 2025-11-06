"use client";

import { Calendar } from "lucide-react";

export default function EventCard({
  id,
  title,
  date,
  price,
  is_online,
  banner_url,
  onSelect,
}: {
  id: number;
  title: string;
  date: string | null;
  price: number | null;
  is_online: boolean;
  banner_url?: string | null;
  onSelect?: () => void;
}) {
  const fallback = "/conference-banner.jpg";
  const src = banner_url || fallback;
  const typeText = is_online ? "ONLINE EVENT" : "OFFLINE EVENT";
  const dateText = date
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(date.replace(" ", "T")))
    : "-";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="text-left rounded-lg overflow-hidden border border-[#1E263A] bg-[#0F1629] hover:border-[#3B82F6] transition-colors"
    >
      <div className="relative">
        <img
          src={src}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallback; }}
          alt={title}
          className="w-full h-44 object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 text-xs font-semibold rounded ${is_online ? "bg-[#3B82F6] text-white" : "bg-[#111b2e] text-gray-200"}`}>
            {typeText}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white mb-3 line-clamp-2">{title}</h3>
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
          <Calendar className="w-4 h-4" />
          <span>{dateText}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[#1E263A]">
          <span className="text-lg font-bold text-white">Rp {Intl.NumberFormat("id-ID").format(price || 0)}</span>
        </div>
      </div>
    </button>
  );
}
