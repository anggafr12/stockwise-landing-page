"use client";

export type CourseLevel = 'beginer' | 'intermediate' | 'advanced';

type Props = {
  value: CourseLevel | null;
  onChange: (v: CourseLevel | null) => void;
};

const ITEMS: Array<{ key: CourseLevel; title: string; subtitle: string; icon: string; iconBg: string }>= [
  { key: 'beginer',      title: 'BEGINNER',     subtitle: 'Basic Investment Knowledge',   icon: '🥚', iconBg: 'bg-blue-500/20' },
  { key: 'intermediate', title: 'INTERMEDIATE', subtitle: 'Tips to Maintain Investment',  icon: '🐥', iconBg: 'bg-emerald-500/20' },
  { key: 'advanced',     title: 'ADVANCED',     subtitle: 'Advance Invest Secret for Stocks', icon: '🐂', iconBg: 'bg-amber-500/20' },
];

export default function CourseLevelFilter({ value, onChange }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-[40px] leading-none font-semibold text-white">Category</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {ITEMS.map((it) => {
          const active = value === it.key;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => onChange(active ? null : it.key)}
              className={[
                'group flex items-center justify-between rounded-2xl px-6 py-6',
                'bg-[#0E1A3A] hover:bg-[#10214A] transition-colors',
                'border',
                active ? 'border-blue-500/60 shadow-[0_0_0_3px_rgba(37,99,235,0.2)]' : 'border-white/5',
              ].join(' ')}
              aria-pressed={active}
            >
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl ${it.iconBg}`}>
                  {it.icon}
                </div>
                <div className="text-left">
                  <div className="text-white tracking-wide text-[28px] leading-none font-semibold">{it.title}</div>
                  <div className="text-white/70 text-sm mt-1">{it.subtitle}</div>
                </div>
              </div>
              <div className={[ 'w-12 h-12 rounded-full flex items-center justify-center', active ? 'bg-blue-600' : 'bg-blue-700/40 group-hover:bg-blue-600/70', ].join(' ')} aria-hidden>
                <span className="text-white text-xl">›</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

