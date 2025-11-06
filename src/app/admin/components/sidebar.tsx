"use client";

import { cn } from "@/lib/utils"; // kalau tidak ada, ganti dengan (…classes: string[]) => classes.filter(Boolean).join(" ")
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  Film,          // ⬅️ icon untuk Videos
  Users,
  CreditCard,
  Settings,
} from "lucide-react";

// ⬇️ tambahkan "videos" di union type
type Section =
  | "dashboard"
  | "events"
  | "courses"
  | "videos"
  | "users"
  | "transactions"
  | "membership"| "batches"| "settings";

export default function Sidebar({
  active,
  onChange,
}: {
  active: Section;
  onChange: (s: Section) => void;
}) {
  const items: { id: Section; label: string; icon: any }[] = [
    { id: "dashboard",   label: "Dashboard",    icon: LayoutDashboard },
    { id: "events",      label: "Events",       icon: CalendarDays },
    { id: "courses",     label: "Courses",      icon: GraduationCap },
    { id: "videos",      label: "Videos",       icon: Film },          // ⬅️ menu baru
    { id: "users",       label: "Users",        icon: Users },
    { id: "transactions",label: "Transactions", icon: CreditCard },
    { id: "membership",  label: "Membership",   icon: CreditCard },
    { id: "batches",     label: "Batches",      icon: CalendarDays },
    { id: "settings",    label: "Settings",     icon: Settings },
  ];

  return (
    <aside className="hidden md:block w-full max-w-[260px]">
      <div className="rounded-2xl border border-white/10 bg-[#0F1629] p-4 md:p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Admin Menu</h2>
          <p className="muted text-xs">Kelola modul yang tersedia</p>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Admin sections">
          {(items ?? []).map((it) => {
            const Icon = it.icon;
            const isActive = active === it.id;
            return (
              <button
                key={it.id}
                onClick={() => onChange(it.id)}
                className={cn(
                  "relative w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all text-left",
                  isActive
                    ? "bg-white/10 text-white shadow-soft"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <span className="absolute inset-y-2 -left-1 w-1 rounded-full bg-gradient-to-b from-brand-500 to-brand-300" />
                )}
                <span className={cn("grid h-9 w-9 place-items-center rounded-lg bg-white/5", isActive && "bg-gradient-to-br from-brand-600/80 to-brand-500/60")}> 
                  <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-white/70")} />
                </span>
                <span className="font-medium">{it.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
