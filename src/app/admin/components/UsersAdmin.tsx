"use client";

import { useEffect, useState } from "react";
import { listUsers, updateUser, type UserRow } from "@/lib/admin/users";
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
import { roleToTier } from "@/lib/tier";

const ROLE_OPTIONS: UserRow["role"][] = ["guest", "member", "admin"];

export default function UsersAdmin() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [q, setQ] = useState("");
  const [role, setRole] = useState<"all" | UserRow["role"]>("all");
  const [verified, setVerified] = useState<"all" | "true" | "false">("all");
  const [sortBy, setSortBy] =
    useState<"created_at" | "name" | "email" | "role" | "is_verified" | "updated_at">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [editing, setEditing] = useState<UserRow | null>(null);

  async function fetchData(p = page) {
    try {
      setLoading(true);
      setErr(null);
      const resp = await listUsers({
        page: p,
        limit,
        q: q.trim() || undefined,
        role: role === "all" ? undefined : role,
        verified: verified === "all" ? undefined : verified === "true",
        sort_by: sortBy,
        sort_dir: sortDir,
      });
      setRows(resp.rows ?? []);
      setTotal(resp.total ?? 0);
    } catch (e: any) {
      console.error("[UsersAdmin] fetch error:", e);
      setErr(e?.message || "Gagal memuat users");
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

  function onFilter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    fetchData(1);
  }

  const maxPage = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Users</h2>
        <form onSubmit={onFilter} className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Cari name/email/username"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="w-64 bg-[#0F1629] border-[#1E263A] text-white"
          />
          <Select value={role} onValueChange={(value) => setRole(value as any)}>
            <SelectTrigger className="w-40 bg-[#0F1629] border-[#1E263A] text-white">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {ROLE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={verified} onValueChange={(value) => setVerified(value as any)}>
            <SelectTrigger className="w-36 bg-[#0F1629] border-[#1E263A] text-white">
              <SelectValue placeholder="Verified" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Verified</SelectItem>
              <SelectItem value="false">Unverified</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-44 bg-[#0F1629] border-[#1E263A] text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">created_at</SelectItem>
              <SelectItem value="updated_at">updated_at</SelectItem>
              <SelectItem value="name">name</SelectItem>
              <SelectItem value="email">email</SelectItem>
              <SelectItem value="role">role</SelectItem>
              <SelectItem value="is_verified">is_verified</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortDir} onValueChange={(value) => setSortDir(value as any)}>
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
      </div>

      <Separator className="bg-[#1E263A]" />

      {err && <div className="text-sm text-red-400">{err}</div>}
      {loading ? (
        <div className="text-sm text-gray-400">Memuat...</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-gray-400">Tidak ada user.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#1E263A]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#0A0F1E] text-gray-300">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Tier Exp.</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id} className="border-t border-[#1E263A] text-gray-200">
                  <td className="px-4 py-3">{user.id}</td>
                  <td className="px-4 py-3">{user.name || "-"}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.username || "-"}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">{user.is_verified ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">{user.membership_tier ?? '-'}</td>
                  <td className="px-4 py-3">{user.membership_expires_at ? new Date(user.membership_expires_at).toLocaleString() : '-'}</td>
                  <td className="px-4 py-3">{new Date(user.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="outline"
                      className="border-[#1E263A] text-gray-200"
                      onClick={() => setEditing(user)}
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
            onClick={() => {
              const prev = Math.max(1, page - 1);
              setPage(prev);
              fetchData(prev);
            }}
          >
            Prev
          </Button>
          <span className="text-gray-300">
            Halaman {page} / {maxPage}
          </span>
          <Button
            className="bg-[#3B82F6] hover:bg-[#2563EB]"
            disabled={page >= maxPage}
            onClick={() => {
              const next = Math.min(maxPage, page + 1);
              setPage(next);
              fetchData(next);
            }}
          >
            Next
          </Button>
        </div>
      </div>

      {editing && (
        <EditUserDialog
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

function EditUserDialog({
  data,
  onClose,
  onSaved,
}: {
  data: UserRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(data.name ?? "");
  const [username, setUsername] = useState(data.username ?? "");
  const [role, setRole] = useState<UserRow["role"]>(data.role);
  const [verified, setVerified] = useState<boolean>(!!data.is_verified);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSave() {
    try {
      setSaving(true);
      setErr(null);
      await updateUser(data.id, {
        name,
        username,
        role,
        is_verified: verified,
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
          <DialogTitle>Edit User #{data.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {err && <div className="text-sm text-red-400">{err}</div>}
          <div>
            <Label className="text-gray-300">Name</Label>
            <Input
              className="bg-[#0A0F1E] border-[#1E263A] text-white"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <Label className="text-gray-300">Username</Label>
            <Input
              className="bg-[#0A0F1E] border-[#1E263A] text-white"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div>
            <Label className="text-gray-300">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as any)}>
              <SelectTrigger className="bg-[#0A0F1E] border-[#1E263A] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="verified-flag"
              type="checkbox"
              checked={verified}
              onChange={(event) => setVerified(event.target.checked)}
            />
            <Label htmlFor="verified-flag" className="text-gray-300">
              Verified
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300">Membership Tier</Label>
              <Input readOnly className="bg-[#0A0F1E] border-[#1E263A] text-white opacity-70" value={data.membership_tier ?? '-'} />
            </div>
            <div>
              <Label className="text-gray-300">Tier Expires</Label>
              <Input readOnly className="bg-[#0A0F1E] border-[#1E263A] text-white opacity-70" value={data.membership_expires_at ? new Date(data.membership_expires_at).toLocaleString() : '-'} />
            </div>
          </div>
          <div>
            <Label className="text-gray-300">Email</Label>
            <Input
              readOnly
              className="bg-[#0A0F1E] border-[#1E263A] text-white opacity-70"
              value={data.email}
            />
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
