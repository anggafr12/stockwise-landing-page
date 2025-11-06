"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PlanCard from "./components/PlanCard";
import { listPlans, checkoutMembership } from "@/lib/membership";
import { getToken } from "@/lib/http";

export default function MembershipPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) {
      navigate("/auth/sign-in-3", { replace: true });
      return;
    }
    (async () => {
      try {
        const r = await listPlans();
        setPlans(r.rows || []);
      } catch (e) {
        // no-op
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const onSelect = async (plan_id: number) => {
    try {
      const r = await checkoutMembership(plan_id);
      const url = (r as any)?.invoice?.invoice_url || (r as any)?.invoice?.url;
      if (url) window.location.href = url;
    } catch (e: any) {
      alert(e?.message || "Gagal membuat invoice");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pilih Paket Membership</h1>
        <p className="muted text-sm">Sesuaikan kebutuhan belajar dan dukungan community Stockwise.</p>
      </div>
      <div className="card p-4 md:p-6">
        {loading ? (
          <div className="text-sm text-white/70">Memuat...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <PlanCard key={p.id} plan={p} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




