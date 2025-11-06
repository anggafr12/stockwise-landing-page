"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listCourses,
  createCourse,
  updateCourse,
  uploadCourseThumb,
  type CourseRow,
} from "@/lib/admin/courses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const TIER_OPTIONS: Array<"FREE" | "PREMIUM" | "VIP"> = ["FREE", "PREMIUM", "VIP"];
const LEVEL_OPTIONS: Array<"beginer" | "intermediate" | "advanced"> = ["beginer","intermediate","advanced"];

export default function CoursesAdmin() {
  // ======= list state =======
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  // ======= filters =======
  const [q, setQ] = useState("");
  const [published, setPublished] = useState<"all" | "true" | "false">("all");
  const [minTier, setMinTier] = useState<"all" | "FREE" | "PREMIUM" | "VIP">("all");
  const [sortBy, setSortBy] =
    useState<"created_at" | "price" | "title" | "updated_at">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ======= create state =======
  const [cTitle, setCTitle] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cPrice, setCPrice] = useState<string>("0");
  const [cTier, setCTier] = useState<"FREE" | "PREMIUM" | "VIP">("FREE");
  const [cLevel, setCLevel] = useState<"beginer"|"intermediate"|"advanced">("beginer");
  const [cPub, setCPub] = useState(false);
  const [cThumb, setCThumb] = useState<File | null>(null);
  const [cThumbPreview, setCThumbPreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [cErr, setCErr] = useState<string | null>(null);

  // ======= edit dialog =======
  const [editing, setEditing] = useState<CourseRow | null>(null);

  async function fetchData(p = page) {
    try {
      setLoading(true);
      setErr(null);
      const resp = await listCourses({
        page: p,
        limit,
        q: q.trim() || undefined,
        published: published === "all" ? undefined : published === "true",
        min_tier: minTier === "all" ? undefined : minTier,
        sort_by: sortBy,
        sort_dir: sortDir,
      });
      setRows(resp.rows ?? []);
      setTotal(resp.total ?? 0);
    } catch (e: any) {
      console.error("[CoursesAdmin] list error:", e);
      setErr(e?.message || "Gagal memuat courses");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxPage = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  function onFilter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    fetchData(1);
  }

  function handlePage(next: number) {
    const safe = Math.min(Math.max(1, next), maxPage);
    if (safe !== page) {
      setPage(safe);
      fetchData(safe);
    }
  }

  function onPickThumb(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setCThumb(file);
  }

  useEffect(() => {
    if (!cThumb) {
      setCThumbPreview(null);
      return;
    }
    const preview = URL.createObjectURL(cThumb);
    setCThumbPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [cThumb]);

  async function onCreateCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setCreating(true);
      setCErr(null);

      const priceNum = Number(cPrice || 0);
      const created = await createCourse({
        title: cTitle,
        description: cDesc,
        price: priceNum,
        min_tier: cTier,
        course_level: cLevel,
        is_published: cPub,
      });

      if (cThumb && created?.id) {
        await uploadCourseThumb(created.id, cThumb);
      }

      setCTitle("");
      setCDesc("");
      setCPrice("0");
      setCTier("FREE");
      setCLevel("beginer");
      setCPub(false);
      setCThumb(null);

      setPage(1);
      await fetchData(1);
    } catch (e: any) {
      console.error("[CoursesAdmin] create error:", e);
      setCErr(e?.message || "Gagal menambahkan course");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Courses</h2>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Left column: create form */}
        <div className="xl:col-span-2 space-y-3">
          <div className="bg-[#0F1629] border border-[#1E263A] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Tambah Course</h3>
            {cErr && <div className="text-sm text-red-400 mb-3">{cErr}</div>}
            <form className="space-y-3" onSubmit={onCreateCourse}>
              <div>
                <Label className="text-gray-300">Title</Label>
                <Input
                  value={cTitle}
                  onChange={(e) => setCTitle(e.target.value)}
                  required
                  className="bg-[#0A0F1E] border-[#1E263A] text-white"
                  placeholder="Judul course"
                />
              </div>
              <div>
                <Label className="text-gray-300">Description</Label>
                <Input
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  className="bg-[#0A0F1E] border-[#1E263A] text-white"
                  placeholder="Deskripsi singkat"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300">Price</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={cPrice}
                    onChange={(e) => setCPrice(e.target.value)}
                    className="bg-[#0A0F1E] border-[#1E263A] text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Min Tier</Label>
                  <Select value={cTier} onValueChange={(value) => setCTier(value as any)}>
                    <SelectTrigger className="bg-[#0A0F1E] border-[#1E263A] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIER_OPTIONS.map((tier) => (
                        <SelectItem key={tier} value={tier}>
                          {tier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Course Level</Label>
                <Select value={cLevel} onValueChange={(v)=> setCLevel(v as any)}>
                  <SelectTrigger className="bg-[#0A0F1E] border-[#1E263A] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVEL_OPTIONS.map((lv) => (
                      <SelectItem key={lv} value={lv}>{lv}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="create-published"
                  type="checkbox"
                  checked={cPub}
                  onChange={(e) => setCPub(e.target.checked)}
                />
                <Label htmlFor="create-published" className="text-gray-300">
                  Published
                </Label>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Thumbnail</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={onPickThumb}
                  className="bg-[#0A0F1E] border-[#1E263A] text-white file:text-gray-300"
                />
                {cThumbPreview && (
                  <img
                    src={cThumbPreview}
                    alt="preview"
                    className="mt-2 w-full max-h-48 rounded-lg border border-[#1E263A] object-cover"
                  />
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-[#3B82F6] hover:bg-[#2563EB]"
                >
                  {creating ? "Menyimpan..." : "Tambah Course"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right column: list + filters */}
        <div className="xl:col-span-3">
          <div className="bg-[#0F1629] border border-[#1E263A] rounded-xl p-5 space-y-4">
            <form onSubmit={onFilter} className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="Cari judul/deskripsi"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-64 bg-[#0F1629] border-[#1E263A] text-white"
              />
              <Select value={published} onValueChange={(v) => setPublished(v as any)}>
                <SelectTrigger className="w-36 bg-[#0F1629] border-[#1E263A] text-white">
                  <SelectValue placeholder="Published" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Published</SelectItem>
                  <SelectItem value="false">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={minTier} onValueChange={(v) => setMinTier(v as any)}>
                <SelectTrigger className="w-44 bg-[#0F1629] border-[#1E263A] text-white">
                  <SelectValue placeholder="Min Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tier</SelectItem>
                  {TIER_OPTIONS.map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-44 bg-[#0F1629] border-[#1E263A] text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">created_at</SelectItem>
                  <SelectItem value="updated_at">updated_at</SelectItem>
                  <SelectItem value="price">price</SelectItem>
                  <SelectItem value="title">title</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortDir} onValueChange={(v) => setSortDir(v as any)}>
                <SelectTrigger className="w-28 bg-[#0F1629] border-[#1E263A] text-white">
                  <SelectValue placeholder="Dir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">desc</SelectItem>
                  <SelectItem value="asc">asc</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="bg-[#3B82F6] hover:bg-[#2563EB]">
                Filter
              </Button>
            </form>

            <Separator className="bg-[#1E263A]" />

            {err && <div className="text-sm text-red-400">{err}</div>}
            {loading ? (
              <div className="text-sm text-gray-400">Memuat...</div>
            ) : rows.length === 0 ? (
              <div className="text-sm text-gray-400">Tidak ada course.</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-[#1E263A]">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[#0A0F1E] text-gray-300">
                    <tr>
                      <th className="px-4 py-3">Thumb</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Published</th>
                      <th className="px-4 py-3">Min Tier</th>
                      <th className="px-4 py-3">Level</th>
                      <th className="px-4 py-3">Updated</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((course) => (
                      <tr key={course.id} className="border-t border-[#1E263A] text-gray-200">
                        <td className="px-4 py-3">
                          {course.thumbnail_url ? (
                            <img
                              src={course.thumbnail_url}
                              alt={course.title}
                              className="h-12 w-20 rounded border border-[#1E263A] object-cover"
                            />
                          ) : (
                            <div className="h-12 w-20 rounded border border-[#1E263A] bg-[#111b2e]" />
                          )}
                        </td>
                        <td className="px-4 py-3">{course.title}</td>
                        <td className="px-4 py-3">
                          {Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
                            course.price ?? 0
                          )}
                        </td>
                        <td className="px-4 py-3">{course.is_published ? "Yes" : "No"}</td>
                        <td className="px-4 py-3">{course.min_tier}</td>
                        <td className="px-4 py-3">
                          <span className={
                            course.course_level === 'advanced' ? 'px-2 py-1 rounded bg-amber-500/15 text-amber-300 text-xs' :
                            course.course_level === 'intermediate' ? 'px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 text-xs' :
                            'px-2 py-1 rounded bg-blue-500/15 text-blue-300 text-xs'
                          }>
                            {String(course.course_level || 'beginer').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {course.updated_at ? new Date(course.updated_at).toLocaleString() : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="outline"
                            className="border-[#1E263A] text-gray-200"
                            onClick={() => setEditing(course)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-400">
              <div>
                Total: <span className="text-gray-200 font-medium">{total}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-[#1E263A] text-gray-200"
                  disabled={page <= 1}
                  onClick={() => handlePage(page - 1)}
                >
                  Prev
                </Button>
                <span className="text-gray-300">
                  Halaman {page} / {maxPage}
                </span>
                <Button
                  className="bg-[#3B82F6] hover:bg-[#2563EB]"
                  disabled={page >= maxPage}
                  onClick={() => handlePage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <EditCourseDialog
          data={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            fetchData(page);
          }}
        />
      )}
    </div>
  );
}

function EditCourseDialog({
  data,
  onClose,
  onSaved,
}: {
  data: CourseRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description ?? "");
  const [price, setPrice] = useState(String(data.price ?? 0));
  const [tier, setTier] = useState<CourseRow["min_tier"]>(data.min_tier);
  const [level, setLevel] = useState<"beginer"|"intermediate"|"advanced">((data as any).course_level || 'beginer');
  const [pub, setPub] = useState<boolean>(!!data.is_published);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSave() {
    try {
      setSaving(true);
      setErr(null);
      await updateCourse(data.id, {
        title,
        description,
        price: Number(price || 0),
        min_tier: tier,
        course_level: level,
        is_published: pub,
      });
      onSaved();
    } catch (e: any) {
      setErr(e?.message || "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0F1629] border-[#1E263A] text-white">
        <DialogHeader>
          <DialogTitle>Edit Course #{data.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {err && <div className="text-sm text-red-400">{err}</div>}
          <div>
            <Label className="text-gray-300">Title</Label>
            <Input
              className="bg-[#0A0F1E] border-[#1E263A] text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-gray-300">Description</Label>
            <Input
              className="bg-[#0A0F1E] border-[#1E263A] text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-gray-300">Price</Label>
            <Input
              type="number"
              className="bg-[#0A0F1E] border-[#1E263A] text-white"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-gray-300">Min Tier</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as any)}>
              <SelectTrigger className="bg-[#0A0F1E] border-[#1E263A] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIER_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-300">Course Level</Label>
            <Select value={level} onValueChange={(v)=> setLevel(v as any)}>
              <SelectTrigger className="bg-[#0A0F1E] border-[#1E263A] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((lv) => (
                  <SelectItem key={lv} value={lv}>{lv}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="edit-published"
              type="checkbox"
              checked={pub}
              onChange={(e) => setPub(e.target.checked)}
            />
            <Label htmlFor="edit-published" className="text-gray-300">
              Published
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="border-[#1E263A] text-gray-200"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            disabled={saving}
            className="bg-[#3B82F6] hover:bg-[#2563EB]"
            onClick={onSave}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
