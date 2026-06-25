"use client";

import { EVENT_COLORS, type CalendarEvent } from "@/lib/types";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";

export function AgendaWidget({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <CalendarClock size={22} className="mb-2 text-white/25" />
        <p className="text-sm text-white/40">Nothing scheduled today.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2.5">
      {events.map((ev) => (
        <li
          key={ev.id}
          className="flex items-center gap-3 rounded-[10px] border border-surface-border bg-white/[0.02] px-3 py-2.5"
        >
          <span
            className="h-8 w-1 rounded-full"
            style={{ backgroundColor: EVENT_COLORS[ev.category] }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{ev.title}</p>
            <p className="text-xs capitalize text-white/40">{ev.category}</p>
          </div>
          <span className="shrink-0 text-xs font-medium text-cyan">
            {format(new Date(ev.start_time), "h:mm a")}
          </span>
        </li>
      ))}
    </ul>
  );
}
