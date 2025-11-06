"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  listEvents, createEvent, updateEvent, deleteEvent, uploadEventBanner,
} from "@/lib/admin/events";
import type { EventRow } from "@/lib/admin/events";

function toISO(date: string, time: string) {
  if (!date) return null;
  const hhmm = time || "00:00";
  // Assume local -> backend convert to Asia/Jakarta server-side if needed
  return `${date} ${hhmm}:00`;
}

export default function EventsAdmin() {
  // filters
  const [q, setQ] = useState("");
  const [published, setPublished] = useState<"all"|"true"|"false">("all");
  const [isOnline, setIsOnline] = useState<"all"|"true"|"false">("all");

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // list
  const [rows, setRows] = useState<EventRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // create form
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [online, setOnline] = useState(true);
  const [eventUrl, setEventUrl] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [pub, setPub] = useState(true);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // edit
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<EventRow | null>(null);
  const [editBannerFile, setEditBannerFile] = useState<File | null>(null);
  const [editBannerPreview, setEditBannerPreview] = useState<string | null>(null);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await listEvents({
          page, limit,
          q: q || undefined,
          published: published === "all" ? undefined : published === "true",
          is_online: isOnline === "all" ? undefined : isOnline === "true",
          sort: "updated_at.desc",
        });
        setRows(res.rows || []);
        setTotal(res.total || 0);
      } catch (e) {
        console.error(e);
        setRows([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [q, published, isOnline, page, limit]);

  const resetCreate = () => {
    setTitle(""); setDesc(""); setDate(""); setTime("");
    setOnline(true); setEventUrl(""); setLocation("");
    setPrice(""); setPub(true);
    setBannerFile(null); setBannerPreview(null);
  };

  const onCreate = async () => {
    if (!title) return alert("Judul wajib diisi");
    const event_date = toISO(date, time);
    try {
      const created = await createEvent({
        title,
        description: desc || null,
        event_date,
        price: price === "" ? null : Number(price),
        is_online: online,
        event_url: online ? eventUrl || null : null,
        location: online ? null : (location || null),
        is_published: pub,
      });
      if (bannerFile) {
        await uploadEventBanner(created.id, bannerFile);
      }
      resetCreate();
      // refresh
      const res = await listEvents({ page, limit, q: q || undefined });
      setRows(res.rows || []); setTotal(res.total || 0);
    } catch (e:any) {
      console.error(e);
      alert(`Gagal membuat event: ${e.message || e}`);
    }
  };

  const openEdit = (r: EventRow) => {
    setEditRow(r);
    setEditOpen(true);
    setEditBannerFile(null);
    setEditBannerPreview(r.banner_url || null);
  };

  const doUpdate = async () => {
    if (!editRow) return;
    try {
      await updateEvent(editRow.id, {
        title: editRow.title,
        description: editRow.description,
        event_date: editRow.event_date,
        price: editRow.price,
        is_online: editRow.is_online,
        event_url: editRow.is_online ? (editRow.event_url || null) : null,
        location: editRow.is_online ? null : (editRow.location || null),
        is_published: editRow.is_published,
      });
      if (editBannerFile) {
        await uploadEventBanner(editRow.id, editBannerFile);
      }
      setEditOpen(false);
      const res = await listEvents({ page, limit, q: q || undefined });
      setRows(res.rows || []); setTotal(res.total || 0);
    } catch (e:any) {
      console.error(e);
      alert(`Gagal update event: ${e.message || e}`);
    }
  };

  const doDelete = async (id: number) => {
    if (!confirm("Hapus event ini?")) return;
    try {
      await deleteEvent(id);
      const res = await listEvents({ page, limit, q: q || undefined });
      setRows(res.rows || []); setTotal(res.total || 0);
    } catch (e:any) {
      console.error(e);
      alert(`Gagal hapus: ${e.message || e}`);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* LEFT: Create */}
      <div className="lg:col-span-1 bg-[#0F1629] border border-[#1E263A] rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Tambah Event</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-gray-300">Judul</Label>
            <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Judul event" className="mt-1"/>
          </div>
          <div>
            <Label className="text-gray-300">Deskripsi</Label>
            <Textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Deskripsi singkat" className="mt-1"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300">Tanggal</Label>
              <Input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1"/>
            </div>
            <div>
              <Label className="text-gray-300">Waktu</Label>
              <Input type="time" value={time} onChange={e=>setTime(e.target.value)} className="mt-1"/>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Online?</Label>
            </div>
            <Switch checked={online} onCheckedChange={setOnline}/>
          </div>

          {online ? (
            <div>
              <Label className="text-gray-300">Event URL</Label>
              <Input value={eventUrl} onChange={e=>setEventUrl(e.target.value)} placeholder="https://..." className="mt-1"/>
            </div>
          ) : (
            <div>
              <Label className="text-gray-300">Lokasi</Label>
              <Input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Venue" className="mt-1"/>
            </div>
          )}

          <div>
            <Label className="text-gray-300">Harga (opsional)</Label>
            <Input type="number" value={price} onChange={e=>setPrice(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0" className="mt-1"/>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-gray-300">Published</Label>
            <Switch checked={pub} onCheckedChange={setPub}/>
          </div>

          <div>
            <Label className="text-gray-300">Banner</Label>
            <Input type="file" accept="image/*" className="mt-1"
              onChange={(e)=>{
                const f = e.target.files?.[0] || null;
                setBannerFile(f);
                setBannerPreview(f ? URL.createObjectURL(f) : null);
              }}/>
            {bannerPreview && (
              <img src={bannerPreview} alt="preview" className="mt-3 h-28 w-full object-cover rounded"/>
            )}
          </div>

          <div className="flex gap-3">
            <Button className="bg-[#3B82F6] hover:bg-[#2563EB]" onClick={onCreate}>Simpan</Button>
            <Button variant="outline" className="border-[#1E263A] text-gray-200" onClick={resetCreate}>Reset</Button>
          </div>
        </div>
      </div>

      {/* RIGHT: List */}
      <div className="lg:col-span-2 bg-[#0F1629] border border-[#1E263A] rounded-xl p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Input placeholder="Cari judul/desc..." value={q} onChange={e=>{ setQ(e.target.value); setPage(1); }} className="w-64"/>
            <Select value={published} onValueChange={(v: any)=>{ setPublished(v); setPage(1);} }>
              <SelectTrigger className="w-36"><SelectValue placeholder="Published"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Published: Semua</SelectItem>
                <SelectItem value="true">Published</SelectItem>
                <SelectItem value="false">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={isOnline} onValueChange={(v: any)=>{ setIsOnline(v); setPage(1);} }>
              <SelectTrigger className="w-36"><SelectValue placeholder="Mode"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mode: Semua</SelectItem>
                <SelectItem value="true">Online</SelectItem>
                <SelectItem value="false">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-gray-400">
            {loading ? "Loading..." : `Total: ${total}`}
          </div>
        </div>

        <Separator className="my-4 bg-[#1E263A]" />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-400">
              <tr>
                <th className="py-2 pr-3">Banner</th>
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Event Time</th>
                <th className="py-2 pr-3">Mode</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 pr-3">Published</th>
                <th className="py-2 pr-3">Updated</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {(rows || []).length === 0 && !loading && (
                <tr><td colSpan={8} className="py-6 text-center text-gray-400">Belum ada data</td></tr>
              )}
              {(rows || []).map((r)=>(
                <tr key={r.id} className="border-t border-[#1E263A]">
                  <td className="py-2 pr-3">
                    {r.banner_url ? (
                      <img src={r.banner_url} alt="" className="h-14 w-24 object-cover rounded"/>
                    ) : <span className="text-gray-500">—</span>}
                  </td>
                  <td className="py-2 pr-3 text-white font-medium">{r.title}</td>
                  <td className="py-2 pr-3 text-gray-300">{r.event_date || "—"}</td>
                  <td className="py-2 pr-3">{r.is_online ? "Online" : "Offline"}</td>
                  <td className="py-2 pr-3">{r.price ?? 0}</td>
                  <td className="py-2 pr-3">{r.is_published ? "Yes" : "No"}</td>
                  <td className="py-2 pr-3">{r.updated_at?.slice(0,19).replace("T"," ")}</td>
                  <td className="py-2 pr-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-[#1E263A] text-gray-200"
                        onClick={()=>openEdit(r)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={()=>doDelete(r.id)}>Hapus</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-gray-400">
            Halaman {page} / {totalPages}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-[#1E263A] text-gray-200" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</Button>
            <Button variant="outline" className="border-[#1E263A] text-gray-200" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next</Button>
            <Select value={String(limit)} onValueChange={(v:any)=>{ setLimit(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* EDIT dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[#0F1629] border border-[#1E263A] text-white">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {editRow && (
            <div className="space-y-3">
              <div>
                <Label>Judul</Label>
                <Input value={editRow.title} onChange={e=>setEditRow({...editRow, title: e.target.value})}/>
              </div>
              <div>
                <Label>Deskripsi</Label>
                <Textarea value={editRow.description || ""} onChange={e=>setEditRow({...editRow, description: e.target.value})}/>
              </div>
              <div>
                <Label>Event DateTime (ISO atau “YYYY-MM-DD HH:mm:ss”)</Label>
                <Input value={editRow.event_date || ""} onChange={e=>setEditRow({...editRow, event_date: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Online?</Label>
                  <div className="mt-2"><Switch checked={editRow.is_online} onCheckedChange={(v)=>setEditRow({...editRow, is_online: v})}/></div>
                </div>
                <div>
                  <Label>Harga</Label>
                  <Input type="number" value={editRow.price ?? 0} onChange={e=>setEditRow({...editRow, price: Number(e.target.value)})}/>
                </div>
              </div>
              {editRow.is_online ? (
                <div>
                  <Label>Event URL</Label>
                  <Input value={editRow.event_url || ""} onChange={e=>setEditRow({...editRow, event_url: e.target.value})}/>
                </div>
              ) : (
                <div>
                  <Label>Lokasi</Label>
                  <Input value={editRow.location || ""} onChange={e=>setEditRow({...editRow, location: e.target.value})}/>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label>Published</Label>
                <Switch checked={editRow.is_published} onCheckedChange={(v)=>setEditRow({...editRow, is_published: v})}/>
              </div>
              <Separator className="my-2 bg-[#1E263A]" />
              <div>
                <Label>Ganti Banner</Label>
                <Input type="file" accept="image/*" onChange={(e)=>{
                  const f = e.target.files?.[0] || null;
                  setEditBannerFile(f);
                  setEditBannerPreview(f ? URL.createObjectURL(f) : (editRow.banner_url || null));
                }}/>
                {editBannerPreview && (
                  <img src={editBannerPreview} className="mt-3 h-28 w-full object-cover rounded"/>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-[#1E263A] text-gray-200" onClick={()=>setEditOpen(false)}>Batal</Button>
            <Button className="bg-[#3B82F6] hover:bg-[#2563EB]" onClick={doUpdate}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
