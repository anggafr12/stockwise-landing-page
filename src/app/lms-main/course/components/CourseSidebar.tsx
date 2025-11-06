"use client";

export default function CourseSidebar({ course, videosCount, coursePct, onStartPlay, durationText }: { course: any; videosCount: number; coursePct: number; onStartPlay?: () => void; durationText?: string }) {
  const pct = Math.round((coursePct || 0) * 100);
  const thumb = course?.thumbnail_url || '/course-thumbnail.jpg';
  return (
    <div className="rounded-2xl bg-[#0E1525] p-4">
      {/* hero */}
      <div className="rounded-xl overflow-hidden border border-[#1E263A] bg-[#0F1629] mb-4 relative group">
        <img src={thumb} alt={course?.title || 'thumbnail'} className="w-full h-40 object-cover opacity-90" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/course-thumbnail.jpg'}} />
        <button onClick={onStartPlay} className="absolute inset-0 flex items-center justify-center">
          <span className="px-4 py-2 rounded-full bg-[#3B82F6] group-hover:bg-[#2563EB] text-white text-xs font-semibold shadow">Play</span>
        </button>
      </div>

      <div className="text-white/60 text-xs uppercase tracking-wider mb-2">{(course?.course_level || 'BEGINNER').toString()}</div>
      <div className="text-white text-xl font-semibold mb-1">{course?.title || '-'}</div>
      <div className="text-white/60 text-sm mb-3">{videosCount} Videos{durationText ? ` • ${durationText}` : ''}</div>
      <div className="w-full h-2 rounded bg-white/10 overflow-hidden mb-2">
        <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-white/70 text-sm mb-3">{pct}% completed</div>
      <p className="text-white/50 text-sm">{course?.description}</p>
    </div>
  );
}
