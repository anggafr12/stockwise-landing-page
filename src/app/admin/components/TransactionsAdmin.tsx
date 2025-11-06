"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listEventPurchases, type EventPurchaseRow } from "@/app/admin/services/transactions";

function normalizeList(resp: unknown): EventPurchaseRow[] {
  if (Array.isArray(resp)) return resp as EventPurchaseRow[];
  if (resp && typeof resp === "object") {
    const obj = resp as { rows?: unknown; data?: unknown };
    const list = obj.rows ?? obj.data ?? [];
    return Array.isArray(list) ? (list as EventPurchaseRow[]) : [];
  }
  return [];
}

export default function TransactionsAdmin() {
  const [rows, setRows] = useState<EventPurchaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listEventPurchases();
      setRows(normalizeList(data));
    } catch (e: any) {
      const message = e?.message || "Gagal memuat transaksi";
      setRows([]);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const list = Array.isArray(rows) ? rows : [];

  return (
    <div className="bg-[#0F1629] border border-[#1E263A] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">Event Transactions</h3>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-12 rounded-lg bg-[#1E263A] animate-pulse" />
          ))}
        </div>
      ) : !error && list.length === 0 ? (
        <div className="py-12 text-center text-gray-400 border border-dashed border-[#1E263A] rounded-lg">
          Tidak ada transaksi.
        </div>
      ) : (
        !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-200">
              <thead>
                <tr className="text-left text-gray-400 border-b border-[#1E263A]">
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">User</th>
                  <th className="py-3 pr-4">Event</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">Gateway</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">TX ID</th>
                </tr>
              </thead>
              <tbody>
                {(list ?? []).map((r) => (
                  <tr key={r.id} className="border-b border-[#0A1324]">
                    <td className="py-3 pr-4">{new Date(r.purchased_at).toLocaleString()}</td>
                    <td className="py-3 pr-4">{r.users?.email || r.user_id}</td>
                    <td className="py-3 pr-4">{r.events?.title || r.event_id}</td>
                    <td className="py-3 pr-4">Rp {Number(r.amount || 0).toLocaleString("id-ID")}</td>
                    <td className="py-3 pr-4">{r.payment_gateway || "-"}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-1 rounded ${
                          r.payment_status === "PAID"
                            ? "bg-green-600"
                            : r.payment_status === "FAILED"
                            ? "bg-red-600"
                            : "bg-gray-600"
                        }`}
                      >
                        {r.payment_status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{r.transaction_id || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
