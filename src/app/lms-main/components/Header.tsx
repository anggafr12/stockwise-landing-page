"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { Button } from "./ui/button";
import { Logo } from "@/components/logo";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getToken, clearToken } from "@/lib/http";
import { getMe } from "@/lib/app";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);

  useEffect(() => {
    const t = getToken();
    setHasToken(!!t);
    if (!t) return; // not logged in
    (async () => {
      try {
        const resp = await getMe();
        const u = (resp as any)?.user || resp;
        setUsername(u?.username || null);
      } catch {
        // ignore if unauthorized or failed
      }
    })();
  }, []);

  const handleLogout = () => {
    try {
      clearToken();
      localStorage.removeItem("CURRENT_USER");
    } catch {}
    setUsername(null);
    setHasToken(false);
    navigate("/auth/sign-in-3");
  };

  const navItems = [
    { name: "Education", path: "/lms-main" },
    { name: "Stock Research", path: "/stock-research" },
    { name: "Event", path: "/eventpage" },
    { name: "Referral", path: "/referral" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-[#081637] border-b border-[#0d1c3a] sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Logo size={28} />
              <span className="text-xl font-bold text-white">STOCKWISE</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-10">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "text-white after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[#0070F3]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/user"
              className="flex items-center gap-2 text-[#0070F3] hover:text-blue-400 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>{username ?? "username"}</span>
            </Link>
            {hasToken && (
              <Button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1 h-8 bg-transparent border border-[#1E263A] text-gray-300 hover:bg-[#0F1629]"
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
