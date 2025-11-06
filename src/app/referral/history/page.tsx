"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { listCommissions } from "@/services/referral";
import { formatIDR } from "@/lib/money";

const STATUSES = ["all", "approved", "paid", "pending", "rejected"] as const;

export default function ReferralHistoryPage() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const load = async () => {
    setLoading(true);
    const resp = await listCommissions({ status: status === 'all' ? undefined : status, limit, offset });
    setRows(resp.rows || []);
    setTotal(resp.total || 0);
    setLoading(false);
  };

  useEffect(() => {
    setOffset(0);
  }, [status]);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status, offset]);

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Referral History</h1>
        <p className="text-sm text-white/60">Riwayat komisi yang Anda terima.</p>
      </div>

      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader className="space-y-4">
          <CardTitle className="text-base font-medium">Commissions</CardTitle>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-sm border ${status===s? 'bg-white/10 border-white/20':'bg-white/0 border-white/10 hover:bg-white/5'} `}
              >{s.toUpperCase()}</button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_,i)=> <Skeleton key={i} className="h-10 w-full bg-white/10" />)}
            </div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-white/70">Belum ada komisi.
              <span className="block text-white/60">Bagikan link referral untuk mulai mendapatkan komisi.</span>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>#{String(r.transaction_id ?? r.id).padStart(4,'0')}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          r.status==='paid' ? 'bg-emerald-500/15 text-emerald-300':
                          r.status==='approved' ? 'bg-blue-500/15 text-blue-300':
                          r.status==='pending' ? 'bg-yellow-500/15 text-yellow-300':'bg-red-500/15 text-red-300'}`}>{String(r.status).toUpperCase()}</span>
                      </TableCell>
                      <TableCell>{new Date(r.created_at).toLocaleString('id-ID')}</TableCell>
                      <TableCell className="text-right">{formatIDR(Number(r.amount||0))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-white/60">Total: {total}</span>
            <div className="flex gap-2">
              <Button variant="outline" disabled={!canPrev} onClick={()=> setOffset(Math.max(0, offset - limit))}>Prev</Button>
              <Button variant="outline" disabled={!canNext} onClick={()=> setOffset(offset + limit)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

