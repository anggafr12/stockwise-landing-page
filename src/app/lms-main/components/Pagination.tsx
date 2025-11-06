"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

export default function Pagination({
  page,
  limit,
  total,
  onChange,
}: {
  page: number;
  limit: number;
  total: number;
  onChange: (page: number, limit: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return (
    <div className="flex items-center justify-between gap-3 text-gray-300">
      <div className="text-xs">Halaman {page} / {totalPages}</div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-[#1E263A] text-gray-200"
          onClick={() => onChange(Math.max(1, page - 1), limit)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-[#1E263A] text-gray-200"
          onClick={() => onChange(Math.min(totalPages, page + 1), limit)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <select
          value={String(limit)}
          onChange={(e) => onChange(1, Number(e.target.value))}
          className="bg-[#0F1629] border border-[#1E263A] text-gray-200 rounded px-2 py-1 text-sm"
        >
          <option value="12">12</option>
          <option value="24">24</option>
          <option value="48">48</option>
        </select>
      </div>
    </div>
  );
}
