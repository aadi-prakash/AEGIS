"use client";

import { MOODS, MOOD_COLORS, type Mood } from "@/lib/types";

export function MoodSelector({
  value,
  onChange,
  size = "md",
}: {
  value: Mood | null;
  onChange: (m: Mood | null) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map((mood) => {
        const active = value === mood;
        const color = MOOD_COLORS[mood];
        return (
          <button
            key={mood}
            type="button"
            onClick={() => onChange(active ? null : mood)}
            className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-all ${
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
            }`}
            style={{
              backgroundColor: active ? `${color}22` : "rgba(255,255,255,0.03)",
              borderColor: active ? `${color}80` : "rgba(255,255,255,0.08)",
              color: active ? color : "rgba(231,231,238,0.6)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {mood}
          </button>
        );
      })}
    </div>
  );
}
