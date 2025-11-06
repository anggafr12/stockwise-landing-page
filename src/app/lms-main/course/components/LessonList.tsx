"use client";

export default function LessonList({ videos, progress, currentVideoId, onSelect }: { videos: any[]; progress: Record<number, any>; currentVideoId?: number; onSelect: (v: any) => void }) {
  return (
    <div className="rounded-2xl bg-[#0E1525] p-4">
      <div className="text-white/90 font-semibold mb-3">Lesson List</div>
      <ul className="space-y-2">
        {videos.map((v) => {
          const last = progress?.[v.id]?.last_position_seconds || 0;
          const dur = v.duration_seconds || 0;
          const pct = dur ? Math.min(last / dur, 1) : 0;
          const active = currentVideoId === v.id;
          return (
            <li
              key={v.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${active ? 'bg-[#1E263A]' : 'hover:bg-white/5'}`}
              onClick={() => onSelect(v)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-blue-400 flex items-center justify-center text-xs">{Math.round(pct * 100)}%</div>
                <div className="text-white/90">{v.title}</div>
              </div>
              <div className="text-white/50 text-sm">{secToMMSS(dur)}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function secToMMSS(s: number = 0) {
  const m = Math.floor(s / 60);
  const ss = String(Math.floor(s % 60)).padStart(2, '0');
  return `${m}:${ss}`;
}
