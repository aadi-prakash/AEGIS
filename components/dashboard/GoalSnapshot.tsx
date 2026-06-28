"use client";

import { CATEGORY_COLORS, type Goal } from "@/lib/types";
import { Target } from "lucide-react";

export function GoalSnapshot({ goals }: { goals: Goal[] }) {
  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Target size={22} className="mb-2 text-white/25" />
        <p className="text-sm text-white/40">No active goals yet.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3.5">
      {goals.map((g) => {
        const color = CATEGORY_COLORS[g.category];
        return (
          <li key={g.id}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-white">
                {g.title}
              </span>
              <span className="shrink-0 text-xs font-semibold text-white/60">
                {g.progress}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${g.progress}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
