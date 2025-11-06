"use client";

import { ArrowRight } from "lucide-react";
import React from "react";

export type LevelValue = "beginer" | "intermediate" | "advanced" | null;

type Props = {
  value: LevelValue;
  onChange: (v: LevelValue) => void;
};

const CARDS: Array<{ key: Exclude<LevelValue, null>; title: string; sub: string; icon?: string; iconBg: string }> = [
  { key: "beginer", title: "BEGINNER", sub: "Basic Investment Knowledge", icon: undefined, iconBg: "bg-blue-500/20" },
  { key: "intermediate", title: "INTERMEDIATE", sub: "Tips to Maintain Investment", icon: undefined, iconBg: "bg-emerald-500/20" },
  { key: "advanced", title: "ADVANCED", sub: "Advance Invest Secret for Stocks", icon: undefined, iconBg: "bg-amber-500/20" },
];

export default function LevelFilter({ value, onChange }: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {CARDS.map((c) => {
        const active = value === c.key;
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onChange(active ? null : c.key)}
            className={[
              "group relative rounded-2xl p-5 text-left",
              "bg-[#0F1629] border",
              active
                ? "border-[#3B82F6]/60 ring-2 ring-[rgba(110,127,243,.35)] shadow-[0_0_0_1px_rgba(110,127,243,.2),0_8px_24px_rgba(0,0,0,.35)]"
                : "border-[#1E263A] hover:border-[#3B82F6]/50",
              "transition-all duration-200 will-change-transform hover:-translate-y-0.5 hover:scale-[1.01]",
            ].join(" ")}
            aria-pressed={active}
          >
            <div className="flex items-center gap-5">
              <div className={`h-16 w-16 rounded-xl grid place-items-center ${c.iconBg}`}>
                {/* optional icon slot */}
                {c.icon ? <img src={c.icon} alt="" className="h-8 w-8 opacity-90" /> : <span className="text-white/70">{c.title[0]}</span>}
              </div>
              <div className="flex-1">
                <div className="text-xl tracking-wide font-semibold text-white">{c.title}</div>
                <div className="text-sm text-white/60">{c.sub}</div>
              </div>
              <div className="h-10 w-10 rounded-full grid place-items-center bg-white/5 group-hover:bg-white/10 transition">
                <ArrowRight className="h-5 w-5 text-white/90" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

