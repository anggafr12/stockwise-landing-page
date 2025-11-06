"use client";

import * as Popover from "@radix-ui/react-popover";
import React, { useEffect, useState } from "react";
import { LogOut, User2, Ticket, CreditCard, Share2, Shield } from "lucide-react";
import { useMe } from "@/services/useMe";
import { Link, useNavigate } from "react-router-dom";
import { clearToken } from "@/lib/http";

function MenuItem({ icon: Icon, label, to, onClick }: { icon: any; label: string; to: string; onClick?: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5" role="menuitem">
      <Icon size={16} className="text-white/80" />
      <span className="text-sm">{label}</span>
    </Link>
  );
}

export default function ProfileMenu() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const initials = (me?.name || me?.username || "U").slice(0, 1).toUpperCase();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>((me as any)?.avatar_url);
  useEffect(() => {
    setAvatarUrl((me as any)?.avatar_url);
  }, [me]);
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button aria-label="Profile" aria-haspopup="menu" className="w-10 h-10 rounded-full bg-white/10 border border-white/10 overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--sw-ring)]">
          {avatarUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img src={avatarUrl} className="w-full h-full object-cover" />
          ) : (
            <span className="grid place-items-center w-full h-full text-sm">{initials}</span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={12} align="end" className="z-50">
          <div className="glass rounded-2xl w-[360px] p-3 animate-fade-up" role="menu" aria-label="Profile menu">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
              <div className="w-12 h-12 rounded-xl bg-white/10 overflow-hidden">
                {avatarUrl ? (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <img src={avatarUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="grid place-items-center h-full">{initials}</div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{me?.name ?? me?.username ?? "Username"}</div>
                <div className="text-xs text-white/60 truncate">{me?.email ?? "email@domain.com"}</div>
              </div>
              <span className="badge">{(me?.membership_tier || "FREE").toString()}</span>
            </div>
            <div className="px-2 py-1.5">
              <div className="text-xs text-white/50 mb-2">Akun</div>
              <MenuItem icon={User2} label="Profil Saya" to="/user?tab=profile" />
              <MenuItem icon={Shield} label="Keamanan Akun" to="/user?tab=password" />
              <MenuItem icon={CreditCard} label="Membership" to="/user?tab=membership" />
              <MenuItem icon={Ticket} label="Tiket Saya" to="/user?tab=myTickets" />
              <MenuItem icon={Share2} label="Referral" to="/referral" />
              {me?.role === 'admin' && (
                <MenuItem icon={Shield} label="Admin Console" to="/admin" />
              )}
            </div>
            {/* Avatar upload removed from popup by request */}
            <div className="px-2 pt-1">
              <button
                onClick={() => {
                  clearToken();
                  try { localStorage.removeItem('CURRENT_USER'); } catch {}
                  navigate('/auth/sign-in-3');
                }}
                className="w-full flex items-center gap-2 text-red-300/90 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 rounded-xl px-3 py-2"
              >
                <LogOut size={16} /> Keluar
              </button>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
