"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEventOrder } from "@/lib/public/events";
import { getToken } from "@/lib/http";
import { getMe } from "@/lib/app";

export default function OrderDetails({ eventId, qty, onPay }: { eventId: number; qty: number; onPay?: (orderId: number) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");
  const [gender, setGender] = useState("");
  const [membership, setMembership] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null); // prepare for gateway integration

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const backUrl = useMemo(() => {
    const sp = new URLSearchParams(searchParams);
    sp.set("step", "order");
    sp.set("id", String(eventId));
    sp.set("qty", String(Math.max(1, qty || 1)));
    return `/eventpage?${sp.toString()}`;
  }, [searchParams, eventId, qty]);

  // Guard: require token to continue ordering
  useEffect(() => {
    const t = getToken();
    if (!t) {
      const msg = encodeURIComponent("Silakan login untuk melanjutkan pembelian.");
      navigate(`/auth/sign-in-3?msg=${msg}&next=${encodeURIComponent(backUrl)}`);
    }
  }, [navigate, backUrl]);

  // Optional prefill from profile
  useEffect(() => {
    (async () => {
      try {
        const t = getToken();
        if (!t) return; // already handled by guard
        const me = await getMe();
        if (me?.name) setName(me.name);
        if (me?.email) setEmail(me.email);
      } catch {}
    })();
  }, []);

  async function submit() {
    try {
      setLoading(true); setErr(null);
      const resp = await createEventOrder({
        event_id: eventId,
        quantity: Math.max(1, qty || 1),
        buyer: { name, email, phone, birth_date: birth || undefined, gender: gender || undefined, membership: membership || undefined },
      });
      const orderId = (resp as any)?.order_id ?? (resp as any)?.data?.order_id;
      if (!orderId) throw new Error("Gagal membuat order");
      setOrderId(orderId);
      onPay?.(orderId);
    } catch (e: any) {
      setErr(e?.message || "Gagal membuat order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh]">
      <h1 className="text-2xl font-bold text-white mb-6">Order Details</h1>
      {err && (
        <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{err}</div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-gray-300">Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-[#0F1629] border-[#1E263A] text-white" />
          </div>
          <div>
            <Label className="text-gray-300">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#0F1629] border-[#1E263A] text-white" />
          </div>
          <div>
            <Label className="text-gray-300">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-[#0F1629] border-[#1E263A] text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300">Birth Date</Label>
              <Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} className="bg-[#0F1629] border-[#1E263A] text-white" />
            </div>
            <div>
              <Label className="text-gray-300">Gender</Label>
              <Input value={gender} onChange={(e) => setGender(e.target.value)} placeholder="male/female" className="bg-[#0F1629] border-[#1E263A] text-white" />
            </div>
          </div>
          <div>
            <Label className="text-gray-300">Membership</Label>
            <Input value={membership} onChange={(e) => setMembership(e.target.value)} placeholder="e.g. basic" className="bg-[#0F1629] border-[#1E263A] text-white" />
          </div>
        </div>
        <div className="rounded-lg border border-[#1E263A] bg-[#0F1629] p-4 h-max">
          <div className="text-gray-300 mb-2">Quantity</div>
          <div className="text-white text-xl font-semibold">{qty} Ticket</div>
          <div className="mt-6">
            <Button disabled={loading} onClick={submit} className="w-full bg-[#3B82F6] hover:bg-[#2563EB]">Bayar Tiket</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
