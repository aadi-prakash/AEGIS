"use client";

import { useMemo } from "react";
import {
  eachDayOfInterval,
  format,
  startOfWeek,
  subDays,
} from "date-fns";
import { isoDate } from "@/lib/utils";

// GitHub-style heatmap of journaling consistency over the last ~26 weeks.
export function ContributionHeatmap({ dates }: { dates: string[] }) {
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of dates) m.set(d, (m.get(d) ?? 0) + 1);
    return m;
  }, [dates]);

  const weeks = useMemo(() => {
    const end = new Date();
    const start = startOfWeek(subDays(end, 25 * 7), { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start, end });
    const cols: { date: Date; key: string; count: number }[][] = [];
    let col: { date: Date; key: string; count: number }[] = [];
    days.forEach((date) => {
      const key = isoDate(date);
      col.push({ date, key, count: counts.get(key) ?? 0 });
      if (col.length === 7) {
        cols.push(col);
        col = [];
      }
    });
    if (col.length) cols.push(col);
    return cols;
  }, [counts]);

  const shade = (count: number) => {
    if (count <= 0) return "rgba(255,255,255,0.05)";
    if (count === 1) return "rgba(99,102,241,0.45)";
    if (count === 2) return "rgba(99,102,241,0.7)";
    return "#6366F1";
  };

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-1">
        {weeks.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((cell) => (
              <div
                key={cell.key}
                title={`${format(cell.date, "MMM d, yyyy")} — ${
                  cell.count
                } ${cell.count === 1 ? "entry" : "entries"}`}
                className="h-3 w-3 rounded-[3px] transition-transform hover:scale-125"
                style={{ backgroundColor: shade(cell.count) }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/40">
        <span>Less</span>
        {[0, 1, 2, 3].map((n) => (
          <span
            key={n}
            className="h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: shade(n) }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
