"use client";

import React, { useEffect, useRef, useState } from "react";
import { apiUpload } from "@/lib/http";

export default function AvatarUploader({
  src,
  onUploaded,
}: {
  src?: string | null;
  onUploaded?: (url: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(src || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreview(src || null);
  }, [src]);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    setPreview(URL.createObjectURL(f));
    setLoading(true);
    try {
      const res = await apiUpload<{ avatar_url: string }>("/api/me/avatar", f);
      if (res?.avatar_url) {
        setPreview(res.avatar_url);
        onUploaded?.(res.avatar_url);
      }
    } catch (e: any) {
      setError(e?.message || "Gagal upload avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 border border-white/10">
        {preview ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={preview} className="w-full h-full object-cover" />
        ) : (
          <div className="grid place-items-center h-full text-xs text-white/60">No Img</div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <input ref={ref} type="file" accept="image/*" hidden onChange={onChange} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => ref.current?.click()}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-sm"
          >
            {loading ? "Uploading…" : "Change Avatar"}
          </button>
        </div>
        {error && <div className="text-[11px] text-red-400">{error}</div>}
      </div>
    </div>
  );
}
