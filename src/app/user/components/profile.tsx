"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/app/lms-main/components/ui/button";
import { Input } from "@/app/lms-main/components/ui/input";
import { Label } from "@/app/lms-main/components/ui/label";
import { Textarea } from "@/app/lms-main/components/ui/textarea";
import { API_BASE } from "@/lib/http";
import { getMe, updateMyProfile, type Me } from "@/lib/user";
import AvatarUploader from "@/components/profile/AvatarUploader";

export default function Profile({ me: meProp, onUpdated }: { me?: Me; onUpdated?: (m: Me) => void }) {
  const [me, setMe] = useState<Me | null>(meProp || null);

  const [batch, setBatch] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [discord, setDiscord] = useState("");
  const [address, setAddress] = useState("");
  const [job, setJob] = useState("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function hydrate(m: Me) {
    setMe(m);
    // avatar handled by AvatarUploader via prop
    setBatch(m.batch || "");
    setName(m.name || "");
    setUsername(m.username || "");
    setEmail(m.email || "");
    setPhone(m.phone || "");
    setDiscord(m.discord_id || "");
    setAddress(m.address || "");
    setJob(m.job || "");
  }

  useEffect(() => {
    if (meProp) {
      hydrate(meProp);
      return;
    }
    (async () => {
      try {
        const m = await getMe();
        hydrate(((m as any)?.user || m) as any);
      } catch (e: any) {
        setErr(e?.message || "Gagal memuat profil");
      }
    })();
  }, [meProp]);

  const patch = useMemo(() => {
    const p: Partial<Me> = {};
    if (!me) return p;
    if ((me.batch || "") !== batch) p.batch = batch as any;
    if ((me.name || "") !== name) p.name = name as any;
    if ((me.username || "") !== username) p.username = username as any;
    if ((me.phone || "") !== phone) p.phone = phone as any;
    if ((me.discord_id || "") !== discord) p.discord_id = discord as any;
    if ((me.address || "") !== address) p.address = address as any;
    if ((me.job || "") !== job) p.job = job as any;
    return p;
  }, [me, batch, name, username, phone, discord, address, job]);

  async function onSave() {
    if (!me) return;
    try {
      setSaving(true); setErr(null); setOk(null);
      const updated = await updateMyProfile(patch);
      hydrate(updated);
      setOk("Berhasil disimpan");
      onUpdated?.(updated);
    } catch (e: any) {
      setErr(e?.message || "Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-6">User Profile</h1>

      <div className="bg-[#0F1629] rounded-xl p-6 space-y-5 shadow-md border border-[#1E263A] text-white">
        {err && <div className="text-sm text-red-400">{err}</div>}
        {ok && <div className="text-sm text-emerald-400">{ok}</div>}

        <div className="flex items-center gap-4">
          <AvatarUploader
            src={(me as any)?.avatar_url as string | undefined}
            onUploaded={(url) => {
              const next = { ...(me as any), avatar_url: url } as Me;
              setMe(next);
              onUpdated?.(next);
            }}
          />
          <div className="text-xs text-white/60">
            Unggah foto profil Anda. Disarankan ukuran persegi 512x512.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="batch" className="mb-2 block text-gray-300">Batch</Label>
            <Input id="batch" value={batch} onChange={(e) => setBatch(e.target.value)} className="bg-[#0F1629] border-[#1E263A] text-gray-200" />
          </div>
          <div>
            <Label htmlFor="name" className="mb-2 block text-gray-300">Nama Lengkap</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-[#0F1629] border-[#1E263A] text-gray-200" />
          </div>
          <div>
            <Label htmlFor="username" className="mb-2 block text-gray-300">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} className="bg-[#0F1629] border-[#1E263A] text-gray-200" />
          </div>
          <div>
            <Label htmlFor="email" className="mb-2 block text-gray-300">Email</Label>
            <Input id="email" value={email} readOnly className="bg-[#0F1629] border-[#1E263A] text-gray-400" />
          </div>
          <div>
            <Label htmlFor="phone" className="mb-2 block text-gray-300">No Telfon</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-[#0F1629] border-[#1E263A] text-gray-200" />
          </div>
          <div>
            <Label htmlFor="discord" className="mb-2 block text-gray-300">Discord ID</Label>
            <div className="flex gap-2">
              <Input id="discord" value={discord} onChange={(e) => setDiscord(e.target.value)} className="bg-[#0F1629] border-[#1E263A] text-gray-200" />
              <Button type="button" onClick={() => { window.location.href = `${API_BASE}/api/oauth/discord/init`; }} className="bg-[#3B82F6] hover:bg-[#2563EB] whitespace-nowrap">Connect Discord</Button>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="address" className="mb-2 block text-gray-300">Alamat lengkap</Label>
          <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-[#0F1629] border-[#1E263A] text-gray-200" rows={4} />
        </div>
        <div>
          <Label htmlFor="job" className="mb-2 block text-gray-300">Bisnis/Pekerjaan</Label>
          <Input id="job" value={job} onChange={(e) => setJob(e.target.value)} className="bg-[#0F1629] border-[#1E263A] text-gray-200" />
        </div>

        <div className="pt-2">
          <Button disabled={saving} onClick={onSave} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
