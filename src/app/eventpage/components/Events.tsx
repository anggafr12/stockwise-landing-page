// src/app/eventpage/components/Events.tsx
"use client";

import { useEffect, useState } from "react";
import EventCard from "@/app/eventpage/components/EventCard";
import { Button } from "@/components/ui/button";
import { CalendarX } from "lucide-react";
import { listPublishedEvents, type PublicEvent } from "@/lib/public/events";

export default function Events({ onSelectEvent }: { onSelectEvent?: (id: number) => void }) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [rows, setRows] = useState<PublicEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function fetchData(p = page, l = limit) {
    try {
      setLoading(true); setErr(null);
      const nowIso = new Date().toISOString();
      const resp = await listPublishedEvents({
        page: p,
        limit: l,
        q: q.trim() || undefined,
        ...(tab === "upcoming" ? { after: nowIso } : { before: nowIso }),
        sort: tab === "upcoming" ? "event_date.asc" : "event_date.desc",
      });
      setRows(resp.rows || []); setTotal(resp.total || 0);
    } catch (e: any) {
      setErr(e?.message || "Gagal memuat events");
      setRows([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(1, limit); /* eslint-disable-next-line */ }, [tab, q]);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between border-b border-[#1E263A] mb-6">
        <div className="flex items-center gap-8">
          <button onClick={() => { setTab("upcoming"); setPage(1); }} className={`pb-3 px-1 relative ${tab === "upcoming" ? "text-white font-medium" : "text-gray-400"}`}>
            Live / Upcoming
            {tab === "upcoming" && (<span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3B82F6]" />)}
          </button>
          <button onClick={() => { setTab("past"); setPage(1); }} className={`pb-3 px-1 relative ${tab === "past" ? "text-white font-medium" : "text-gray-400"}`}>
            Past Event
            {tab === "past" && (<span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3B82F6]" />)}
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search events"
            className="h-9 rounded bg-[#0F1629] border border-[#1E263A] px-3 text-gray-200"
          />
        </div>
      </div>

      {err && (
        <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{err}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-64 rounded-lg border border-[#1E263A] bg-[#0F1629] animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center mb-4">
            <CalendarX className="w-10 h-10 text-[#3B82F6]" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Events</h3>
          <p className="text-gray-400">Showing 0 from total 0 event</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {rows.map((ev) => (
              <div key={ev.id} className="relative">
                <EventCard
                  id={ev.id}
                  title={ev.title}
                  date={ev.event_date}
                  price={ev.price}
                  is_online={ev.is_online}
                  banner_url={ev.banner_url}
                  onSelect={() => onSelectEvent?.(ev.id)}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 mt-8 text-gray-300">
            <div className="text-xs">Halaman {page} / {totalPages}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-[#1E263A] text-gray-200" disabled={page<=1} onClick={() => { const p = Math.max(1, page-1); setPage(p); fetchData(p, limit); }}>Prev</Button>
              <Button variant="outline" size="sm" className="border-[#1E263A] text-gray-200" disabled={page>=totalPages} onClick={() => { const p = Math.min(totalPages, page+1); setPage(p); fetchData(p, limit); }}>Next</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

