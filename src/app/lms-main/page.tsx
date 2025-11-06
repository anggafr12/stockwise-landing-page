"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CourseCard from "@/app/lms-main/components/CourseCard";
import SearchBar from "@/app/lms-main/components/SearchBar";
import Pagination from "@/app/lms-main/components/Pagination";
import LevelFilter from "@/components/lms/LevelFilter";
import type { MembershipTier } from "@/lib/types";
import { roleToTier, minRoleToTier } from "@/lib/tier";
import { getToken, clearToken } from "@/lib/http";
import { getMe, listAppCourses, listPublicCourses } from "@/lib/app";
import { fetchCourses } from "@/services/api";
import type { CourseLevel } from "@/services/api";



export default function LmsMainPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<any | null>(null);
  const userTier: MembershipTier | undefined = me ? roleToTier((me as any).membership_tier || (me as any).role) : undefined;
  const [sp] = useSearchParams();
  const urlLevel = (sp.get('level') || '').toString();
  const levelFilter = useMemo(() => {
    const v = urlLevel.toLowerCase();
    return ['beginer','intermediate','advanced'].includes(v) ? v : null;
  }, [urlLevel]);

  async function handleAuthError(e: any) {
    const msg = String(e?.message || "");
    if (msg.includes("401") || msg.includes("403")) {
      try { clearToken(); } catch {}
      // Fallback to public list instead of redirect
      try {
        const res = await fetchCourses(levelFilter as any as CourseLevel);
        const rows = (res.items || []).map((c: any) => ({ ...c, min_tier: minRoleToTier(c.min_role) }));
        setRows(rows);
        setTotal(res.total || 0);
        setError(null);
      } catch (err: any) {
        setError(err?.message || "Gagal memuat course publik");
      }
      return true;
    }
    return false;
  }

  async function fetchData(p = page, l = limit) {
    try {
      setLoading(true);
      setError(null);
      const resp = await listAppCourses({ page: p, limit: l, sort: "updated_at.desc", q, level: levelFilter || undefined });
      const rows = (resp.rows || []).map((c: any) => ({ ...c, min_tier: minRoleToTier(c.min_role) }));
      setRows(rows);
      setTotal(resp.total || 0);
    } catch (e: any) {
      if (await handleAuthError(e)) return;
      setError(e?.message || "Gagal memuat course");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      const t = getToken();
      if (t) {
        try {
          const meResp = await getMe();
          const u = (meResp as any)?.user || meResp;
          setMe(u as any);
        } catch (e: any) {
          await handleAuthError(e);
        }
        await fetchData(1, limit);
      } else {
        // Not logged in → show public courses
        try {
          setLoading(true); setError(null);
          const res = await fetchCourses(levelFilter as any as CourseLevel);
          const rows = (res.items || []).map((c: any) => ({ ...c, min_tier: minRoleToTier(c.min_role) }));
          setRows(rows);
          setTotal(res.total || 0);
        } catch (err: any) {
          setError(err?.message || "Gagal memuat course publik");
        } finally {
          setLoading(false);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelFilter]);

  const onPaginate = (p: number, l: number) => {
    setPage(p);
    setLimit(l);
    fetchData(p, l);
  };

  return (
      <div className="w-full py-2">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <h1 className="text-xl font-semibold">Courses</h1>
          <div className="flex-1 max-w-xl"><SearchBar value={q} onChange={setQ} /></div>
        </div>

        <div className="mb-6">
          {/* Level Filter (big cards) */}
          <LevelFilter value={levelFilter as any} onChange={(lv)=> navigate({ search: lv ? `?level=${lv}` : '' }, { replace: false })} />
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="rounded-lg border border-[#1E263A] bg-[#0F1629] h-64 animate-pulse shadow-soft" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="text-gray-400 text-sm border border-dashed border-[#1E263A] rounded-lg p-8">Tidak ada course.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {rows.map((c, i) => (
              <div key={c.id} className="animate-fade-up" style={{ animationDelay: `${i * 45}ms` }}>
                <CourseCard course={c} userTier={userTier} />
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} limit={limit} total={total} onChange={onPaginate} />
      </div>
  );
}
