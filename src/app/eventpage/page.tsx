// src/app/eventpage/page.tsx
"use client";

import { useSearchParams } from "react-router-dom";
import Events from "@/app/eventpage/components/Events";
import EventDetail from "@/app/eventpage/components/EventDetail";
import OrderDetails from "@/app/eventpage/components/OrderDetails";
import Payment from "@/app/eventpage/components/Payment";

type StepId = "events" | "detail" | "order" | "payments";

export default function EventPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeStep = ((): StepId => {
    const v = (searchParams.get("step") as StepId) || "events";
    return ["events", "detail", "order", "payments"].includes(v) ? v : "events";
  })();

  const id = Number(searchParams.get("id") || 0) || 0;
  const qty = Math.max(1, Number(searchParams.get("qty") || 1));
  const orderId = Number(searchParams.get("order_id") || 0) || 0;

  const setStep = (next: StepId, extra?: Record<string, string | number>) => {
    const sp = new URLSearchParams(searchParams);
    sp.set("step", next);
    if (extra) Object.entries(extra).forEach(([k, v]) => sp.set(k, String(v)));
    setSearchParams(sp, { replace: true });
  };

  const renderContent = () => {
    switch (activeStep) {
      case "detail":
        return <EventDetail id={id} onBuy={(q) => setStep("order", { id, qty: q })} />;
      case "order":
        return <OrderDetails eventId={id} qty={qty} onPay={(oid) => setStep("payments", { order_id: oid })} />;
      case "payments":
        return <Payment orderId={orderId} />;
      default:
        return <Events onSelectEvent={(eid) => setStep("detail", { id: eid })} />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="muted text-sm">Kelola agenda, detail tiket, dan pembayaran dalam satu tempat.</p>
      </div>
      <div className="card p-4 md:p-6">
        {renderContent()}
      </div>
    </div>
  );
}
