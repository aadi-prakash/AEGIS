"use client";

import { format } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FitnessLog } from "@/lib/types";

export function ProgressChart({ logs }: { logs: FitnessLog[] }) {
  const data = [...logs]
    .filter((l) => l.weight != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((l) => ({
      date: format(new Date(l.date), "MMM d"),
      weight: l.weight,
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-white/40">
        Log a weight check-in to see your trend.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="weightLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={["dataMin - 2", "dataMax + 2"]}
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: "#15151f",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              fontSize: 12,
            }}
            formatter={(v: number) => [`${v} kg`, "Weight"]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="url(#weightLine)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#22D3EE" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
