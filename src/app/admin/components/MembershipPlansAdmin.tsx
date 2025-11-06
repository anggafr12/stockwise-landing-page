"use client";

import { useEffect, useState } from "react";
import { listMembershipPlans, createMembershipPlan, updateMembershipPlan, deleteMembershipPlan, type MembershipPlan } from "@/lib/admin/memberships";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function MembershipPlansAdmin() {
  const [rows, setRows] = useState<MembershipPlan[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [sort, setSort] = useState("created_at.desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<MembershipPlan | null>(null);
  const [form, setForm] = useState<Partial<MembershipPlan>>({
    code: "", name: "", role_granted: "beginer", price_idr: 0, duration_days: 30, description: "", is_active: true,
  });

  async function fetchData() {
    try {
      setLoading(true); setError(null);
      const res = await listMembershipPlans({ page, limit, q, active: onlyActive, sort });
      setRows(res.rows || []);
      setTotal(res.total || 0);
    } catch (e: any) {
      setError(e.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { fetchData(); /* eslint-disable react-hooks/exhaustive-deps */ }, [page, q, onlyActive, sort]);

  function resetForm() {
    setEditing(null);
    setForm({ code: "", name: "", role_granted: "beginer", price_idr: 0, duration_days: 30, description: "", is_active: true });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    try {
      if (editing) {
        await updateMembershipPlan(editing.id, form);
      } else {
        await createMembershipPlan(form);
      }
      resetForm();
      fetchData();
    } catch (e: any) {
      alert(e.message || "Simpan gagal");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus membership plan ini?")) return;
    try {
      await deleteMembershipPlan(id);
      fetchData();
    } catch (e: any) {
      alert(e.message || "Hapus gagal");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 bg-[#0F1629] border border-[#1E263A] rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-white font-semibold text-lg">Membership Plans</h2>
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
                <th className="text-left py-2">Role</th>
                <th className="text-left py-2">Price</th>
                <th className="text-left py-2">Days</th>
                <th className="text-left py-2">Active</th>
                <th className="text-right py-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              {(rows || []).map((r) => (
                <tr key={r.id} className="border-t border-[#1E263A]">
                  <td className="py-2">{r.code}</td>
                  <td className="py-2">{r.name}</td>
                  <td className="py-2">{r.role_granted}</td>
                  <td className="py-2">Rp {Number(r.price_idr).toLocaleString('id-ID')}</td>
                  <td className="py-2">{r.duration_days}</td>
                  <td className="py-2">{r.is_active ? 'Ya' : 'Tidak'}</td>
                  <td className="py-2 text-right">
                    <Button size="sm" className="mr-2" onClick={()=>{ setEditing(r); setForm(r); }}>Edit</Button>
                    <Button size="sm" variant="outline" className="border-[#1E263A] text-gray-200" onClick={()=>handleDelete(r.id)}>Hapus</Button>
                  </td>
                </tr>
              ))}
              {(!rows || rows.length === 0) && !loading ? (
                <tr><td colSpan={7} className="py-6 text-center text-gray-400">Tidak ada data</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#0F1629] border border-[#1E263A] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">{editing ? 'Edit Plan' : 'Buat Plan'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full bg-[#0A0F1E] border border-[#1E263A] text-white rounded px-3 py-2" placeholder="Code" value={form.code || ''} onChange={(e)=>setForm({...form, code: e.target.value})} />
          <input className="w-full bg-[#0A0F1E] border border-[#1E263A] text-white rounded px-3 py-2" placeholder="Name" value={form.name || ''} onChange={(e)=>setForm({...form, name: e.target.value})} />
          <select className="w-full bg-[#0A0F1E] border border-[#1E263A] text-white rounded px-3 py-2" value={form.role_granted || 'beginer'} onChange={(e)=>setForm({...form, role_granted: e.target.value as any})}>
            <option value="beginer">beginer</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
          </select>
          <input type="number" className="w-full bg-[#0A0F1E] border border-[#1E263A] text-white rounded px-3 py-2" placeholder="Harga (IDR)" value={form.price_idr ?? 0} onChange={(e)=>setForm({...form, price_idr: Number(e.target.value)})} />
          <input type="number" className="w-full bg-[#0A0F1E] border border-[#1E263A] text-white rounded px-3 py-2" placeholder="Durasi (hari)" value={form.duration_days ?? 30} onChange={(e)=>setForm({...form, duration_days: Number(e.target.value)})} />
          <textarea className="w-full bg-[#0A0F1E] border border-[#1E263A] text-white rounded px-3 py-2" placeholder="Deskripsi" value={form.description || ''} onChange={(e)=>setForm({...form, description: e.target.value})} />
          <label className="flex items-center gap-2 text-gray-300 text-sm">
            <input type="checkbox" checked={!!form.is_active} onChange={(e)=>setForm({...form, is_active: e.target.checked})} /> Active
          </label>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="bg-[#3B82F6] hover:bg-[#2563EB]">{editing ? 'Simpan Perubahan' : 'Buat Plan'}</Button>
            {editing ? <Button type="button" variant="outline" className="border-[#1E263A] text-gray-200" onClick={resetForm}>Batal</Button> : null}
          </div>
        </form>
      </div>
    </div>
  );
}

