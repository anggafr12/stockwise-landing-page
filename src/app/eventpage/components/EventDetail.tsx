"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar as CalendarIcon, Clock, Minus, Plus } from "lucide-react";
import { getEventById, type PublicEvent } from "@/lib/public/events";

export default function EventDetail({ id, onBuy }: { id: number; onBuy?: (qty: number) => void }) {
  const [qty, setQty] = useState(1);
  const [row, setRow] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const banner = row?.banner_url || "/conference-banner.jpg";
  const dateText = useMemo(() => {
    if (!row?.event_date) return "-";
    try {
      const d = new Date(row.event_date.replace(" ", "T"));
      return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(d);
    } catch {
      return row.event_date;
    }
  }, [row?.event_date]);

  useEffect(() => {
    (async () => {
      try { setLoading(true); setErr(null); setRow(null);
        const ev = await getEventById(id);
        setRow(ev);
      } catch (e: any) {
        setErr(e?.message || "Gagal memuat event");
      } finally { setLoading(false); }
    })();
  }, [id]);

  return (
    <div className="min-h-[60vh]">
      {err && (
        <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{err}</div>
      )}

      {loading ? (
        <div className="h-64 rounded-lg border border-[#1E263A] bg-[#0F1629] animate-pulse" />
      ) : row && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <img
              src={banner}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/conference-banner.jpg"; }}
              alt={row.title}
              className="w-full rounded-lg mb-6 object-cover max-h-[420px]"
            />

            <div className="border-b border-[#1E263A] pb-4 mb-6">
              <h1 className="text-3xl font-bold text-white">{row.title}</h1>
            </div>

            <div className="flex items-center gap-8 mb-4 border-b border-[#1E263A]">
              <button className="pb-3 px-1 relative text-white font-medium">
                Description
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />
              </button>
            </div>

            <div className="text-gray-300 space-y-4">
              <p>{row.description || "Tidak ada deskripsi."}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#0F1629] rounded-lg border border-[#1E263A] p-6 sticky top-8">
              <div className="bg-[#3B82F6]/10 rounded-lg px-4 py-2 mb-4 text-center">
                <span className="text-xs font-semibold text-[#3B82F6] uppercase">{row.is_online ? 'ONLINE' : 'OFFLINE'} EVENT</span>
              </div>

              <h3 className="font-bold text-white mb-4 line-clamp-2">{row.title}</h3>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#3B82F6] mt-0.5" />
                  <span className="text-gray-300">{row.is_online ? (row.event_url || '-') : (row.location || '-')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-gray-300">{dateText}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-gray-300">WIB</span>
                </div>
              </div>

              <div className="border-t border-dashed border-[#1E263A] pt-6 mb-6">
                <div className="bg-[#0F1629] rounded-lg p-4 mb-4 border border-[#1E263A]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Your Order</span>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <span className="text-sm text-gray-400">Total Ticket</span>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-[#1E263A] text-gray-200" onClick={() => setQty(Math.max(1, qty - 1))}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="font-medium w-8 text-center">{qty}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-[#1E263A] text-gray-200" onClick={() => setQty(qty + 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">Total ({qty} Ticket)</span>
                  <span className="text-xl font-bold text-white">Rp {Intl.NumberFormat('id-ID').format((row.price || 0) * qty)}</span>
                </div>

                <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] font-semibold" onClick={() => onBuy?.(qty)}>
                  Buy Ticket
                </Button>
              </div>

              <div className="text-center pt-6 border-t border-dashed border-[#1E263A]">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-[#3B82F6] rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">SW</span>
                  </div>
                  <span className="text-sm font-bold">STOCKWISE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

