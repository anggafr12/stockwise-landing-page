"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Profile from "@/app/user/components/profile";
import Membership from "@/app/user/components/membership";
import MyTickets from "@/app/user/components/myTickets";
import Password from "@/app/user/components/password";
import { User, CreditCard, Ticket, Lock, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { getToken } from "@/lib/http";
import { getMe } from "@/lib/app";

type Tab = "profile" | "membership" | "myTickets" | "password";

export default function UserPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [user, setUser] = useState<any | null>(null);
  const [activeMembership, setActiveMembership] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const t = getToken();
    if (!t) {
      navigate("/auth/sign-in-3", { replace: true });
      return;
    }
    (async () => {
      try {
        const me = await getMe();
        setUser((me as any)?.user || me || null);
        setActiveMembership((me as any)?.active_membership || null);
      } catch (e: any) {
        setError(e?.message || "Gagal mengambil data profil");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  // Sync tab with query param (?tab=profile|membership|myTickets|password)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = (params.get('tab') || '').toString();
    if (tab && ["profile","membership","myTickets","password"].includes(tab)) {
      setActiveTab(tab as Tab);
    }
  }, [location.search]);

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-sm text-white/70">Memuat...</div>;
  }

  if (error) {
    return <div className="card p-4 md:p-6 text-sm text-red-400">{error}</div>;
  }

  if (!user) {
    return <div className="card p-4 md:p-6 text-sm text-white/70">Sesi berakhir. Silakan login kembali.</div>;
  }

  const tabs: Array<{ key: Tab; label: string; icon: LucideIcon }> = [
    { key: "profile", label: "Profile", icon: User },
    { key: "membership", label: "Membership", icon: CreditCard },
    { key: "myTickets", label: "Tiket Saya", icon: Ticket },
    { key: "password", label: "Password", icon: Lock },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Pengaturan Akun</h1>
        <p className="muted text-sm">Kelola profil, membership, tiket, dan keamanan akun dalam satu tempat.</p>
      </div>

      <div className="card p-3 md:p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  const params = new URLSearchParams(location.search);
                  params.set('tab', key);
                  navigate({ pathname: '/user', search: params.toString() }, { replace: true });
                }}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all",
                  "border border-white/10 bg-white/0 text-white/65 hover:text-white",
                  active && "bg-white/10 text-white shadow-soft border-white/20"
                )}
                type="button"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/60 transition-colors",
                    active && "bg-gradient-to-br from-brand-600/80 to-brand-500/60 text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card p-4 md:p-6">
        {activeTab === "membership" && (
          <Membership me={user} active={activeMembership || undefined} />
        )}
        {activeTab === "profile" && (
          <Profile me={user} onUpdated={(next) => setUser(next)} />
        )}
        {activeTab === "myTickets" && <MyTickets />}
        {activeTab === "password" && <Password />}
      </div>
    </div>
  );
}
