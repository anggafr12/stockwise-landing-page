"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "@/app/lms-main/components/Header";
import SideMenu from "@/app/user/components/sideMenu";
import Profile from "@/app/user/components/profile";
import Membership from "@/app/user/components/membership";
import MyTickets from "@/app/user/components/myTickets";
import Password from "@/app/user/components/password";

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#030915] text-white">
        <Header />
        <div className="flex flex-1 items-center justify-center">Memuat…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#030915] text-white">
        <Header />
        <div className="flex flex-1 items-center justify-center text-red-400">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#030915] text-white">
        <Header />
        <div className="flex flex-1 items-center justify-center">Sesi berakhir. Silakan login kembali.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#030915] text-white">
      <Header />
      <div className="flex flex-1">
        <SideMenu activeTab={activeTab} onChange={setActiveTab} />
        <main className="flex-1 px-6 lg:px-10 xl:px-12 py-8 md:py-10">
          {activeTab === "membership" && (
            <Membership me={user} active={activeMembership || undefined} />
          )}
          {activeTab === "profile" && (
            <Profile me={user} onUpdated={(next) => setUser(next)} />
          )}
          {activeTab === "myTickets" && <MyTickets />}
          {activeTab === "password" && <Password />}
        </main>
      </div>
    </div>
  );
}