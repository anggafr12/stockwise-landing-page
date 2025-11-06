"use client";

import React from "react";
import { Bell } from "lucide-react";
import ProfileMenu from "@/components/profile/ProfileMenu";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 px-6 lg:px-10 py-4 bg-[#0A0E13]/80 backdrop-blur border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
        <div className="ml-auto flex items-center gap-3">
          <input
            placeholder="Search…"
            className="hidden md:block bg-white/5 border border-white/10 rounded-xl py-2 px-3 outline-none focus:border-[#6E7FF3]/50"
          />
          <button className="grid place-items-center w-10 h-10 rounded-xl bg-white/5 border border-white/10" aria-label="Notifications">
            <Bell size={18} className="text-white/80" />
          </button>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

