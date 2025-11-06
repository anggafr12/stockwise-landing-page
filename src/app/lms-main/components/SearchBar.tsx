"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";

export default function SearchBar({ value, onChange, placeholder = "Search course" }: {
  value: string;
  onChange: (q: string) => void;
  placeholder?: string;
}) {
  const [inner, setInner] = useState(value);
  const timer = useRef<number | null>(null);

  useEffect(() => { setInner(value); }, [value]);
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange(inner), 300);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [inner]);

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <Input
        value={inner}
        onChange={(e) => setInner(e.target.value)}
        placeholder={placeholder}
        className="pl-12 h-12 bg-[#0F1629] border border-[#1E263A] text-white placeholder:text-gray-400 focus:border-[#3B82F6] focus:ring-0"
      />
    </div>
  );
}
   
