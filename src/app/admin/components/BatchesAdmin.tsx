"use client";

import { useEffect, useState } from "react";
import { listBatches, createBatch, updateBatch, deleteBatch, type BatchRow } from "@/lib/admin/batches";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function BatchesAdmin() {
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [sort, setSort] = useState("start_date.desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<BatchRow | null>(null);
  const [form, setForm] = useState<Partial<BatchRow>>({ code: "", name: "", start_date: "", end_date: "", is_active: true });

  async function fetchData() {
    try {
      setLoading(true); setError(null);
      const res = await listBatches({ page, limit, q, active: onlyActive, sort });
      setRows(res.rows || []);
      setTotal(res.total || 0);
    } catch (e: any) {
      setError(e.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { fetchData(); /* eslint-disable react-hooks/exhaustive-deps */ }, [page, q, onlyActive, sort]);

  function resetForm() { setEditing(null); setForm({ code: "", name: "", start_date: "", end_date: "", is_active: true }); }

  async function handleSubmit(e: any) {
    e.preventDefault();
    try {
      if (editing) await updateBatch(editing.id, form); else await createBatch(form);
      resetForm(); fetchData();
    } catch (e: any) { alert(e.message || "Simpan gagal"); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus batch ini?")) return;
    try { await deleteBatch(id); fetchData(); } catch (e: any) { alert(e.message || "Hapus gagal"); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 bg-[#0F1629] border border-[#1E263A] rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-white font-semibold text-lg">Batches</h2>
          <div className="flex gap-2">
            <input value={q} onChange={(e)=>{ setPage(1); setQ(e.target.value); }} placeholder="Cari code / name…" className="bg-[#0A0F1E] border border-[#1E263A] text-white rounded px-3 py-2 w-64" />
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <input type="checkbox" checked={onlyActive} onChange={(e)=>{ setPage(1); setOnlyActive(e.target.checked); }} /> Hanya aktif
            </label>
          </div>
        </div>
        <Separator className="my-4 bg-[#1E263A]" />
        {loading ? <p className="text-gray-400 text-sm">Loading…</p> : null}
        {error ? <p className="text-red-400 text-sm">{error}</p> : null}

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-400">
              <tr>
                <th className="text-left py-2">Code</th>
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Start</th>
                <th className="text-left py-2">End</th>
                <th className="text-left py-2">Active</th>
                <th className="text-right py-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              {(rows || []).map((r) => (
                <tr key={r.id} className="border-t border-[#1E263A]">
                  <td className="py-2">{r.code}</td>
                  <td className="py-2">{r.name}</td>
                  <td className="py-2">{r.start_date}</td>
                  <td className="py-2">{r.end_date}</td>
                  <td className="py-2">{r.is_active ? 'Ya' : 'Tidak'}</td>
                  <td className="py-2 text-right">
                    <Button size="sm" className="mr-2" onClick={()=>{ setEditing(r); setForm(r); }}>Edit</Button>
                    <Button size="sm" variant="outline" className="border-[#1E263A] text-gray-200" onClick={()=>handleDelete(r.id)}>Hapus</Button>
                  </td>
                </tr>
              ))}
              {(!rows || rows.length === 0) && !loading ? (
                <tr><td colSpan={6} className="py-6 text-center text-gray-400">Tidak ada data</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#0F1629] border border-[#1E263A] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">{editing ? 'Edit Batch' : 'Buat Batch'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full bg-[#0A0F1E] border border-[#1E263A] text-white rounded px-3 py-2" placeholder="Code" value={form.code || ''} onChange={(e)=>setForm({...form, code: e.target.value})} />
          <input className="w-full bg-[#0A0F1E] border border-[#1E263A] text-white rounded px-3 py-2" placeholder="Name (opsional)" value={form.name || ''} onChange={(e)=>setForm({...form, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-gray-400">
              Start date
              <input type="date" className="w-full mt-1 bg-[#0A0F1E] border border-[#1E263A] text-white rounded px-3 py-2" value={form.start_date || ''} onChange={(e)=>setForm({...form, start_date: e.target.value})} />
            </label>
            <label className="text-xs text-gray-400">
              End date
              <input type="date" className="w-full mt-1 bg-[#0A0F1E] border border-[#1E263A] text-white rounded px-3 py-2" value={form.end_date || ''} onChange={(e)=>setForm({...form, end_date: e.target.value})} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-gray-300 text-sm">
            <input type="checkbox" checked={!!form.is_active} onChange={(e)=>setForm({...form, is_active: e.target.checked})} /> Active
          </label>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="bg-[#3B82F6] hover:bg-[#2563EB]">{editing ? 'Simpan Perubahan' : 'Buat Batch'}</Button>
            {editing ? <Button type="button" variant="outline" className="border-[#1E263A] text-gray-200" onClick={resetForm}>Batal</Button> : null}
          </div>
        </form>
      </div>
    </div>
  );
}

