"use client";

import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  BookOpen,
  LineChart,
  CalendarDays,
  Share2,
  Home,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useMe } from "@/services/useMe";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/lms-main", label: "Education", icon: BookOpen },
  { to: "/stockresearch", label: "Stock Research", icon: LineChart },
  { to: "/eventpage", label: "Event", icon: CalendarDays },
  { to: "/referral", label: "Referral", icon: Share2 },
];

export function Sidebar() {
  const [open, setOpen] = useState(true);
  const { data: me } = useMe();
  const isFree = String((me as any)?.membership_tier || 'FREE').toUpperCase() === 'FREE';

  return (
    <aside
      className={cn(
        "glass sticky top-0 h-screen border-r border-white/10 transition-[width] duration-300 ease-out flex flex-col overflow-hidden",
        open ? "w-[280px]" : "w-[88px]"
      )}
    >
      <div className="flex items-center gap-3 px-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
            <Logo size={28} className="rounded-lg" />
          </div>
          {open && (
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">Stockwise</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Academy</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white"
        >
          {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <div className={cn("px-4 pt-5", open ? "block" : "hidden")}
      >
        <div className="relative">
          <input
            placeholder="Cari menu..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 pr-9 text-sm outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/40"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/40">Cmd+K</span>
        </div>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-2" role="navigation" aria-label="Main">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={!open ? label : undefined}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all",
                open ? "justify-start" : "justify-center",
                isActive
                  ? "bg-white/10 text-white shadow-soft"
                  : "text-white/65 hover:text-white hover:bg-white/5"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-y-2 -left-1 w-1 rounded-full bg-gradient-to-b from-brand-500 to-brand-300" />
                )}
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-white/70 transition-colors",
                    isActive && "bg-gradient-to-br from-brand-600/80 to-brand-500/60 text-white"
                  )}
                >
                  <Icon size={18} />
                </span>
                {open && <span className="font-medium">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-4 pb-5">
        {open ? (
          isFree ? (
            <div className="card p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/70">
                  <Sparkles className="h-4 w-4" />
                </span>
                Upgrade Membership
              </div>
              <p className="text-xs text-white/60">
                Tingkatkan keanggotaan Anda untuk membuka seluruh konten premium.
              </p>
              <Link
                to="/membership"
                className="w-full inline-flex justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-2 text-sm font-semibold text-white shadow-soft"
              >
                Upgrade Membership
              </Link>
            </div>
          ) : (
            <div className="card p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/70">
                  <Sparkles className="h-4 w-4" />
                </span>
                Boost Insight
              </div>
              <p className="text-xs text-white/60">
                Buka akses AI analyst & report otomatis untuk tim kamu.
              </p>
              <button className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-2 text-sm font-semibold text-white shadow-soft">
                Upgrade to Pro
              </button>
            </div>
          )
        ) : (
          isFree ? (
            <Link
              to="/membership"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white"
              aria-label="Upgrade Membership"
              title="Upgrade Membership"
            >
              <Sparkles className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white"
              aria-label="Upgrade"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          )
        )}
      </div>
    </aside>
  );
}
