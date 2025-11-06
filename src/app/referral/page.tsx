"use client";

import { useEffect, useState } from "react";
import { Clipboard, ClipboardCheck, Wallet } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/app/lms-main/components/ui/skeleton";
import { formatIDR } from "@/lib/money";
import { getReferralLinks, getReferralStats, type ReferralLinks, type ReferralStats } from "@/services/referral";

export default function ReferralDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [links, setLinks] = useState<ReferralLinks | null>(null);
  const [copied, setCopied] = useState<"none" | "link" | "code">("none");

  useEffect(() => {
    (async () => {
      try {
        const [s, l] = await Promise.all([getReferralStats(), getReferralLinks()]);
        setStats(s);
        setLinks(l);
      } catch (e: any) {
        toast.error(e?.message || "Gagal memuat data referral");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const copy = async (value: string, t: "link" | "code") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(t);
      setTimeout(() => setCopied("none"), 1200);
      toast.success("Tersalin");
    } catch {
      toast.error("Gagal menyalin");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Referral Dashboard</h1>
        <p className="text-sm text-white/60">Bagikan link/kode Anda dan kumpulkan komisi.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-medium">My Balance</CardTitle>
            <Wallet className="h-5 w-5 text-[#6E7FF3]" />
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-9 w-40 bg-white/10" />
            ) : (
              <div className="text-3xl font-semibold">{formatIDR(stats?.balance ?? 0)}</div>
            )}
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/60">Minimal penarikan {formatIDR(stats?.minWithdraw ?? 0)}</div>
              <Button disabled={!stats?.withdrawable} className="bg-[#5867E9] hover:bg-[#4C74FF]">Withdraw Now</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-base font-medium">Statistik</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {loading ? (
              <>
                <Skeleton className="h-5 w-1/2 bg-white/10" />
                <Skeleton className="h-5 w-3/4 bg-white/10" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Total Approved</span>
                  <span className="font-medium">{formatIDR(stats?.totalApproved ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Total Paid</span>
                  <span className="font-medium text-emerald-300">{formatIDR(stats?.totalPaid ?? 0)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle className="text-base font-medium">Bagikan Link & Kode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-white/60">Registration Link</label>
            {loading ? (
              <Skeleton className="h-9 w-full bg-white/10" />
            ) : (
              <div className="flex items-center gap-2">
                <Input readOnly value={links?.registration_link ?? ''} className="bg-white/10 border-white/10 text-sm" />
                <Button variant="outline" onClick={() => links?.registration_link && copy(links.registration_link, 'link')}>
                  {copied === 'link' ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-white/60">Affiliate Code</label>
            {loading ? (
              <Skeleton className="h-9 w-40 bg-white/10" />
            ) : (
              <div className="flex items-center gap-2">
                <Input readOnly value={links?.code ?? ''} className="bg-white/10 border-white/10 w-auto text-sm" />
                <Button variant="outline" onClick={() => links?.code && copy(links.code, 'code')}>
                  {copied === 'code' ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

