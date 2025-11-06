"use client";

import { User, Ticket, Lock, CreditCard, LogOut, Clock, Settings } from "lucide-react";

interface SideMenuProps {
  activeTab: string;
  onChange?: (tab: string) => void;
  // Back-compat: some callers may still pass setActiveTab
  setActiveTab?: (tab: string) => void;
}

const SideMenu = ({ activeTab, onChange, setActiveTab }: SideMenuProps) => {
  const change = onChange || setActiveTab || (() => {});

  const menuItems = [
    { name: "Profile", key: "profile", icon: <User className="w-4 h-4" /> },
    { name: "Membership", key: "membership", icon: <CreditCard className="w-4 h-4" /> },
    { name: "Transactions History", key: "history", icon: <Clock className="w-4 h-4" /> },
    { name: "Plan Management", key: "plan", icon: <Settings className="w-4 h-4" /> },
    { name: "My Tickets", key: "myTickets", icon: <Ticket className="w-4 h-4" /> },
    { name: "Password", key: "password", icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <aside className="card p-4 md:p-6 w-full space-y-4">
      <div>
        <h2 className="text-base font-semibold">Dashboard</h2>
        <p className="muted text-xs">Navigasi cepat akun Anda</p>
      </div>

      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => change(item.key)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all text-left ${
              activeTab === item.key
                ? "bg-white/10 text-white shadow-soft"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="text-white/80">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default SideMenu;
