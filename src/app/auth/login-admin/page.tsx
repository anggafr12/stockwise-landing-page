"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Shield, User2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost, getToken, setToken, clearToken } from "@/lib/http";

export default function LoginAdminPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error("Isi username/email dan password");
      return;
    }

    setLoading(true);
    try {
      const response = await apiPost<{
        token: string;
        user: {
          id: string;
          username: string;
          email: string;
          name: string;
          role: string;
          is_verified: boolean;
          created_at: string;
        };
      }>("/api/auth/login", { identifier: identifier.trim(), password });

      setToken(response.token);
      if (typeof window !== "undefined") {
        localStorage.setItem("CURRENT_USER", JSON.stringify(response.user));
      }
      toast.success("Login berhasil");
      navigate("/admin", { replace: true });
    } catch (err: any) {
      toast.error(err?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full justify-center py-10">
      <div className="card w-full max-w-md p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Admin Login</h1>
            <p className="muted text-xs">Masuk dengan username/email & password</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Username / Email</Label>
            <div className="relative">
              <Input
                id="identifier"
                placeholder="yourname atau email@domain.com"
                className="pl-9"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />
              <User2 className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className="pl-9 pr-12"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <Lock className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-brand-600 to-brand-500" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </Button>

          <button
            type="button"
            onClick={() => {
              clearToken();
              if (typeof window !== "undefined") {
                localStorage.removeItem("CURRENT_USER");
              }
            }}
            className="w-full text-xs text-white/60 hover:text-white underline underline-offset-4"
          >
            Hapus token tersimpan
          </button>
        </form>
      </div>
    </div>
  );
}





