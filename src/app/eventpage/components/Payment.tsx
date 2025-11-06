"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createPaymentSession } from "@/lib/public/events";
import { getToken } from "@/lib/http";

type TL = { hours: number; minutes: number; seconds: number };

export default function Payment({ orderId }: { orderId: number }) {
  const [timeLeft, setTimeLeft] = useState<TL>({ hours: 0, minutes: 30, seconds: 0 });
  const [url, setUrl] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null); // prepare for gateway integration
  const [info, setInfo] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [oid, setOid] = useState<number>(orderId); // keep local order id for future steps

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const backUrl = useMemo(() => {
    const sp = new URLSearchParams(searchParams);
    sp.set("step", "payments");
    sp.set("order_id", String(orderId));
    return `/eventpage?${sp.toString()}`;
  }, [searchParams, orderId]);

  // Guard: require token to continue payment
  useEffect(() => {
    const t = getToken();
    if (!t) {
      const msg = encodeURIComponent("Silakan login untuk melanjutkan pembelian.");
      navigate(`/auth/sign-in-3?msg=${msg}&next=${encodeURIComponent(backUrl)}`);
    }
  }, [navigate, backUrl]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const tText = `${pad(timeLeft.hours)} : ${pad(timeLeft.minutes)} : ${pad(timeLeft.seconds)}`;

  useEffect(() => {
    (async () => {
      try {
        const resp = await createPaymentSession({ order_id: orderId, gateway: "dummy" });
        const ru = (resp as any)?.redirect_url ?? (resp as any)?.data?.redirect_url ?? null;
        const inst = (resp as any)?.instructions ?? (resp as any)?.data?.instructions ?? null;
        setUrl(ru);
        setRedirectUrl(ru);
        setOid(orderId);
        setInfo(inst);
      } catch (e: any) {
        setErr(e?.message || "Gagal membuat sesi pembayaran");
      }
    })();
  }, [orderId]);

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((p) => {
        if (p.hours === 0 && p.minutes === 0 && p.seconds === 0) return p;
        if (p.seconds > 0) return { ...p, seconds: p.seconds - 1 };
        if (p.minutes > 0) return { hours: p.hours, minutes: p.minutes - 1, seconds: 59 };
        if (p.hours > 0) return { hours: p.hours - 1, minutes: 59, seconds: 59 };
        return p;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-[40vh] rounded-xl border border-[#1E263A] p-6 bg-[#0F1629]">
      {err && (
        <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{err}</div>
      )}
      <h3 className="text-sm text-[#3B82F6] mb-2">Sisa Waktu Pembayaran</h3>
      <div className="text-4xl font-bold text-white mb-4">{tText}</div>
      {url ? (
        <Button onClick={() => window.open(url!, "_blank")!} className="bg-[#3B82F6] hover:bg-[#2563EB]">Lanjutkan ke Pembayaran</Button>
      ) : info ? (
        <div className="text-sm text-gray-300 whitespace-pre-wrap">{info}</div>
      ) : (
        <div className="text-sm text-gray-400">Menyiapkan sesi pembayaran...</div>
      )}
    </div>
  );
}
