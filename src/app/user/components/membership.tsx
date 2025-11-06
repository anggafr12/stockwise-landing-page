"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/app/lms-main/components/ui/button";
import type { Me } from "@/lib/user";
import { getActiveMembership } from "@/lib/membership";
import MembershipBadge from "@/components/MembershipBadge";

function fmtDate(d?: string | null) {
  if (!d) return null;
  try {
    const date = new Date(d);
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return null;
  }
}

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function Membership({ me, active }: { me: Me & { membership_tier?: string }; active?: any }) {
  const navigate = useNavigate();
  const [activeLocal, setActiveLocal] = useState<any | null>(active || null);

  useEffect(() => {
    if (!active) {
      getActiveMembership().then((r) => setActiveLocal(r?.active || null)).catch(() => {});
    }
  }, [active]);

  const tier = useMemo<"guest" | "premium" | "vip">(() => {
    const mt = (me as any)?.membership_tier;
    const base = mt || me.role;
    if (["advanced", "admin"].includes(String(base))) return "vip";
    if (["beginer", "intermediate"].includes(String(base))) return "premium";
    return "guest";
  }, [me]);

  const cardTitle = tier === "vip" ? "VIP MEMBERSHIP" : tier === "premium" ? "PREMIUM MEMBERSHIP" : "NO MEMBERSHIP";
  const nameText = (me?.name || me?.username || "Member").trim();
  const validUntil = fmtDate((activeLocal as any)?.expires_at || (me as any)?.membership_expires_at);
  const dbTierCode = ((me as any)?.membership_tier || '').toUpperCase() as 'FREE'|'PREMIUM'|'VIP' | '';
  const tierMeta = (me as any)?.tier_meta as { name?: string; badge_color?: string } | undefined;

  const cardBg =
    tier === "vip"
      ? "bg-gradient-to-br from-yellow-500/90 to-amber-700/80"
      : tier === "premium"
      ? "bg-gradient-to-br from-blue-800/90 to-blue-500/80"
      : "bg-gradient-to-br from-gray-800/90 to-gray-600/80";

  return (
    <div className="space-y-6 text-white">
      <h1 className="text-3xl font-bold">Membership</h1>

      <div className="rounded-xl border border-[#1E263A] bg-[#0F1629] p-6">
        {/* Card */}
        <div className={cx("rounded-2xl p-8 max-w-xl shadow-md ring-1 ring-white/10", cardBg)}>
          <p className="text-xs tracking-wide uppercase opacity-90 mb-4">{cardTitle}</p>
          <h2 className="text-2xl font-bold mb-12">{nameText}</h2>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] opacity-80 mb-1">VALID UNTIL</p>
              <p className="font-semibold uppercase">{validUntil ?? "-"}</p>
            </div>
            <div className="font-semibold tracking-wide">STOCKWISE</div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full my-6 bg-[#1E263A]" />

        {/* Summary */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#0F1629] border border-[#1E263A]">
              <div>
                <p className="text-sm text-gray-400 mb-1">Annual</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{tier === "guest" ? '-' : (tierMeta?.name || dbTierCode || 'Membership')}</p>
                  {dbTierCode && (
                    <MembershipBadge code={(dbTierCode as any)} name={tierMeta?.name} color={tierMeta?.badge_color} />
                  )}
                </div>
              </div>
              {tier === "guest" ? (
                <span className="text-xs px-3 py-1 rounded border border-red-400/60 text-red-300">No Membership</span>
              ) : (
                <span className="text-xs px-3 py-1 rounded border border-emerald-400/60 text-emerald-300">Active</span>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[#0F1629] border border-[#1E263A]">
              <div className="text-sm text-gray-300">Renewal</div>
              <div className="text-sm">{validUntil ?? "-"}</div>
            </div>

            {tier === "guest" ? (
              <div className="flex items-center justify-end">
                <Button
                  onClick={() => navigate("/membership")}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                >
                  Upgrade Membership
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-end text-sm text-blue-300">
                <button className="hover:underline" onClick={() => navigate("/eventpage")}>Renew Subscription</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
