"use client";

type Role = "guest" | "beginer" | "intermediate" | "advanced" | "admin";

export default function CategoryCard({
  selected,
  onChange,
}: {
  selected: Role | null;
  onChange: (role: Role | null) => void;
}) {
  const roles: Role[] = ["guest", "beginer", "intermediate", "advanced", "admin"];

  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((r) => {
        const active = selected === r;
        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange(active ? null : r)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              active
                ? "bg-[#3B82F6] text-white border-[#3B82F6]"
                : "bg-[#0F1629] text-gray-300 border-[#1E263A] hover:bg-[#0A0F1E]"
            }`}
          >
            {r}
          </button>
        );
      })}
    </div>
  );
}

