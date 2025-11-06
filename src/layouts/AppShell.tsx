"use client";

import React, { ReactNode } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { useLocation } from "react-router-dom";

export default function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  // CSS-based fade; swap to framer-motion when installed
  return (
    <div className="min-h-screen text-white flex bg-[#0A0E13]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main key={location.pathname} className="px-6 py-6 lg:px-10 lg:py-8 animate-fade-up">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

