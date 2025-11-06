"use client";

import { Button } from "@/app/lms-main/components/ui/button";

export default function PlanCard({ plan, onSelect }: { plan: any; onSelect: (id: number) => void }) {
  return (
    <div className="bg-[#0F1629] border border-[#1E263A] rounded-xl p-6 text-white">
      <h3 className="text-lg font-semibold">{plan.name}</h3>
      {plan.description && <p className="text-sm text-gray-400 mt-1">{plan.description}</p>}
      <p className="text-2xl font-bold mt-4">Rp {Number(plan.price_idr || 0).toLocaleString('id-ID')}</p>
      <p className="text-xs text-gray-400 mt-1">{plan.duration_days} hari • Role: {plan.role_granted}</p>
      <Button className="mt-6 bg-[#3B82F6] hover:bg-[#2563EB]" onClick={() => onSelect(plan.id)}>
        Langganan
      </Button>
    </div>
  );
}

