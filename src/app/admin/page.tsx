"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Sidebar,
  EventsAdmin,
  CoursesAdmin,
  UsersAdmin,
  TransactionsAdmin,
  SettingsAdmin,
  VideosAdmin,
  MembershipPlansAdmin,
  BatchesAdmin,
} from "@/app/admin/components";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, CalendarDays, GraduationCap, Users, CreditCard } from "lucide-react";
import { apiGet, getToken } from "@/lib/http";
import ErrorBoundary from "@/components/ErrorBoundary";

type Section =
  | "dashboard"
  | "events"
  | "courses"
  | "videos"
  | "users"
  | "transactions"
  | "membership"
  | "batches"
  | "settings";

export default function AdminPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<Section>("dashboard");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/auth/login-admin", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    const ensureAccess = async () => {
      const token = getToken();
      if (!token) {
        navigate("/auth/login-admin", { replace: true });
        if (!cancelled) setChecking(false);
        return;
      }

      try {
        const { user } = await apiGet<{ user?: { role?: string } }>("/api/auth/me");
        if (!user || user.role !== "admin") {
          navigate("/auth/login-admin", { replace: true });
          return;
        }
      } catch {
        navigate("/auth/login-admin", { replace: true });
        return;
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    ensureAccess();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const renderSection = () => {
    switch (active) {
      case "events":
        return <EventsAdmin />;
      case "courses":
        return <CoursesAdmin />;
      case "videos":
        return <VideosAdmin />;
      case "users":
        return <UsersAdmin />;
      case "transactions":
        return <TransactionsAdmin />;
      case "membership":
        return <MembershipPlansAdmin />;
      case "batches":
        return <BatchesAdmin />;
      case "settings":
        return <SettingsAdmin />;
      default:
        return (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0F1629] via-[#0F1629] to-[#0b1222] p-6">
              <div className="pointer-events-none absolute inset-0 opacity-40" style={{
                backgroundImage: "radial-gradient(50% 50% at 100% 0%, rgba(110,127,243,0.25) 0%, rgba(110,127,243,0) 70%), radial-gradient(40% 40% at 0% 100%, rgba(48,61,128,0.25) 0%, rgba(48,61,128,0) 70%)"
              }} />
              <div className="relative flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
                  <LayoutDashboard className="h-6 w-6 text-brand-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Admin Dashboard</h2>
                  <p className="muted text-sm">Kelola event, course, pengguna, dan transaksi.</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" className="bg-gradient-to-r from-brand-600 to-brand-500" onClick={() => setActive("events")}>
                  <CalendarDays className="mr-2 h-4 w-4" /> Events
                </Button>
                <Button size="sm" variant="outline" className="border-white/10 text-white" onClick={() => setActive("courses")}>
                  <GraduationCap className="mr-2 h-4 w-4" /> Courses
                </Button>
                <Button size="sm" variant="outline" className="border-white/10 text-white" onClick={() => setActive("users")}>
                  <Users className="mr-2 h-4 w-4" /> Users
                </Button>
                <Button size="sm" variant="outline" className="border-white/10 text-white" onClick={() => setActive("transactions")}>
                  <CreditCard className="mr-2 h-4 w-4" /> Transactions
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Kpi title="Total Users" value="1,284" icon={Users} accent="from-emerald-500/20 to-emerald-400/5" />
              <Kpi title="Published Events" value="12" icon={CalendarDays} accent="from-sky-500/20 to-sky-400/5" />
              <Kpi title="Revenue (30d)" value="Rp 185.2 jt" icon={CreditCard} accent="from-amber-500/20 to-amber-400/5" />
              <Kpi title="Pending Payments" value="7" icon={CreditCard} accent="from-rose-500/20 to-rose-400/5" />
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0F1629] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Quick Menus</h3>
                <span className="text-xs text-white/50">Akses cepat</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                <button onClick={() => setActive("events")} className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#0F1629] p-3 text-left hover:bg-white/5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors"><CalendarDays className="h-5 w-5 text-white/80" /></span>
                  <div><div className="text-sm font-medium text-white">Kelola Events</div><div className="text-xs text-white/60">Buat dan atur event</div></div>
                </button>
                <button onClick={() => setActive("courses")} className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#0F1629] p-3 text-left hover:bg-white/5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors"><GraduationCap className="h-5 w-5 text-white/80" /></span>
                  <div><div className="text-sm font-medium text-white">Kelola Courses</div><div className="text-xs text-white/60">Materi & harga</div></div>
                </button>
                <button onClick={() => setActive("users")} className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#0F1629] p-3 text-left hover:bg-white/5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors"><Users className="h-5 w-5 text-white/80" /></span>
                  <div><div className="text-sm font-medium text-white">Kelola Users</div><div className="text-xs text-white/60">Akun & hak akses</div></div>
                </button>
                <button onClick={() => setActive("transactions")} className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#0F1629] p-3 text-left hover:bg-white/5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors"><CreditCard className="h-5 w-5 text-white/80" /></span>
                  <div><div className="text-sm font-medium text-white">Transaksi</div><div className="text-xs text-white/60">Pembayaran & status</div></div>
                </button>
                <button onClick={() => setActive("membership")} className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#0F1629] p-3 text-left hover:bg-white/5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors"><CreditCard className="h-5 w-5 text-white/80" /></span>
                  <div><div className="text-sm font-medium text-white">Membership Plans</div><div className="text-xs text-white/60">Paket & durasi</div></div>
                </button>
                <button onClick={() => setActive("batches")} className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#0F1629] p-3 text-left hover:bg-white/5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors"><CalendarDays className="h-5 w-5 text-white/80" /></span>
                  <div><div className="text-sm font-medium text-white">Batches</div><div className="text-xs text-white/60">Gelombang kelas</div></div>
                </button>
                <button onClick={() => setActive("videos")} className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#0F1629] p-3 text-left hover:bg-white/5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors"><GraduationCap className="h-5 w-5 text-white/80" /></span>
                  <div><div className="text-sm font-medium text-white">Videos</div><div className="text-xs text-white/60">Konten video</div></div>
                </button>
                <button onClick={() => setActive("settings")} className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#0F1629] p-3 text-left hover:bg-white/5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors"><LayoutDashboard className="h-5 w-5 text-white/80" /></span>
                  <div><div className="text-sm font-medium text-white">Settings</div><div className="text-xs text-white/60">Preferensi app</div></div>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0A0E13] text-white grid place-items-center">
        <div className="text-sm text-white/70">Checking access...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E13] text-white flex flex-col">
      <header className="sticky top-0 z-30 px-6 lg:px-10 py-4 bg-[#0A0E13]/80 backdrop-blur border-b border-white/5">
        <div className="w-full flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">Admin Console</h1>
          <span className="ml-auto text-xs text-white/50">Manage content & members</span>
        </div>
      </header>

      <main className="flex-1">
        <div className="w-full px-6 py-6 lg:px-10 lg:py-8">
          <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
            <Sidebar active={active} onChange={setActive} />
            <ErrorBoundary>
              <div className="space-y-6">
                {renderSection()}
              </div>
            </ErrorBoundary>
          </div>
        </div>
      </main>

      <footer className="mt-auto px-6 lg:px-10 py-4 border-t border-white/5 text-xs text-white/50">
        <div className="max-w-7xl mx-auto">Copyright {new Date().getFullYear()} Stockwise Admin</div>
      </footer>
    </div>
  );
}

function Kpi({ title, value, icon: Icon, accent }: { title: string; value: string; icon?: any; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0F1629] p-4">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${accent || 'from-brand-600/20 to-brand-400/10'}`}>
          {Icon ? <Icon className="h-5 w-5 text-white/80" /> : <LayoutDashboard className="h-5 w-5 text-white/80" />}
        </span>
        <div>
          <p className="muted text-xs">{title}</p>
          <p className="text-xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}











