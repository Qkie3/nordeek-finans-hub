import React from "react";
import type { FilterMode } from "@/lib/news-filter";

const MODES: { key: FilterMode; label: string }[] = [
  { key: "all",      label: "Alle" },
  { key: "foryou",   label: "Til dig" },
  { key: "breaking", label: "Breaking" },
  { key: "earnings", label: "Earnings" },
  { key: "guidance", label: "Guidance" },
  { key: "mna",      label: "M&A" },
  { key: "macro",    label: "Makro" },
];

export function NewsChips({ value, onChange }: { value: FilterMode; onChange: (v: FilterMode) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {MODES.map(m => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={[
            "px-3 py-1 rounded border text-sm",
            value === m.key ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent"
          ].join(" ")}
          aria-pressed={value === m.key}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
