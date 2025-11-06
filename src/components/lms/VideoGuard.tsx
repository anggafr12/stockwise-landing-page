"use client";

import React, { useEffect } from "react";

export default function VideoGuard({ watermark = "STOCKWISE" }: { watermark?: string }) {
  useEffect(() => {
    const onContext = (e: MouseEvent) => e.preventDefault();
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k.includes("printscreen") || (e.ctrlKey && (k === "p" || k === "s"))) {
        e.preventDefault();
        const el = document.getElementById("sw-anticap");
        if (el) {
          el.style.opacity = "1";
          setTimeout(() => (el.style.opacity = "0"), 1200);
        }
      }
    };
    document.addEventListener("contextmenu", onContext);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("contextmenu", onContext);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      id="sw-anticap"
      className="pointer-events-none absolute inset-0 flex items-center justify-center text-white/30 text-xl font-semibold transition-opacity duration-300 opacity-0 select-none"
      style={{ mixBlendMode: "difference" }}
    >
      {watermark}
    </div>
  );
}

