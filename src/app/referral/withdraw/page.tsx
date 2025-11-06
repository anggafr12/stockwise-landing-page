"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getReferralStats,
  listWithdrawals,
  getBankInfo,
  saveBankInfo,
  createWithdrawal,
  type ReferralBankInfo,
} from "@/services/referral";
import { formatIDR } from "@/lib/money";

export default function ReferralWithdrawPage() {
  const [tab, setTab] = useState("commission");
  const [stats, setStats] = useState<any>(null);
  const [wds, setWds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bank, setBank] = useState<ReferralBankInfo>({ bank_code: "", account_number: "", account_name: "", tax_id: "" });
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, wl, bi] = await Promise.all([getReferralStats(), listWithdrawals(), getBankInfo()]);
      setStats(s);
      setWds(wl.rows || []);
      if (bi.bank) setBank(bi.bank as any);
    } catch (e: any) {
      toast.error(e?.message || "Gagal memuat data withdraw");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const onSaveBank = async () => {
    try {
      setSaving(true);
      await saveBankInfo(bank);
      toast.success("Disimpan");
    } catch (e: any) {
      toast.error(e?.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const onWithdraw = async () => {
    try {
      await createWithdrawal();
      toast.success("Permintaan withdraw dibuat");
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message || "Gagal membuat withdraw");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Withdraw</h1>
        <p className="text-sm text-white/60">Ajukan penarikan komisi dan kelola data bank.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="text-white">
        <TabsList className="bg-white/10">
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="bank">Bank Information</TabsTrigger>
        </TabsList>

        <TabsContent value="commission" className="mt-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-base font-medium">Total Commission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <Skeleton className="h-9 w-40 bg-white/10" />
              ) : (
                <div className="text-2xl font-semibold">{formatIDR(stats?.balance ?? 0)}</div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Minimal penarikan {formatIDR(stats?.minWithdraw ?? 0)}</span>
                <Button disabled={!stats?.withdrawable} onClick={onWithdraw} className="bg-[#5867E9] hover:bg-[#4C74FF]">Withdraw Commission</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4 bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-base font-medium">Withdraw History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">{Array.from({length:4}).map((_,i)=>(<Skeleton key={i} className="h-10 w-full bg-white/10"/>))}</div>
              ) : wds.length === 0 ? (
                <div className="text-sm text-white/70">Belum ada withdraw.</div>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wds.map((w: any) => (
                        <TableRow key={w.id}>
                          <TableCell>#{String(w.id).padStart(4,'0')}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              w.status==='paid' ? 'bg-emerald-500/15 text-emerald-300':
                              w.status==='processing' ? 'bg-blue-500/15 text-blue-300':
                              w.status==='requested' ? 'bg-yellow-500/15 text-yellow-300':'bg-red-500/15 text-red-300'}`}>{String(w.status).toUpperCase()}</span>
                          </TableCell>
                          <TableCell>{new Date(w.created_at).toLocaleString('id-ID')}</TableCell>
                          <TableCell className="text-right">{formatIDR(Number(w.amount||0))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank" className="mt-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-base font-medium">Bank Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-white/70">Bank Code</label>
                <Input value={bank.bank_code} onChange={(e)=> setBank({...bank, bank_code: e.target.value})} className="bg-white/10 border-white/10" placeholder="BCA / MANDIRI / BRI / BNI"/>
              </div>
              <div>
                <label className="text-sm text-white/70">Account Number</label>
                <Input value={bank.account_number} onChange={(e)=> setBank({...bank, account_number: e.target.value})} className="bg-white/10 border-white/10" />
              </div>
              <div>
                <label className="text-sm text-white/70">Account Name</label>
                <Input value={bank.account_name} onChange={(e)=> setBank({...bank, account_name: e.target.value})} className="bg-white/10 border-white/10" />
              </div>
              <div>
                <label className="text-sm text-white/70">NIK/NPWP (opsional)</label>
                <Input value={bank.tax_id || ''} onChange={(e)=> setBank({...bank, tax_id: e.target.value})} className="bg-white/10 border-white/10" />
              </div>
              <div className="md:col-span-2">
                <Button disabled={saving || !bank.bank_code || !bank.account_number || !bank.account_name} onClick={onSaveBank} className="bg-[#5867E9] hover:bg-[#4C74FF]">Save</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

