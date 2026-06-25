"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, CalendarClock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { EVENT_COLORS, type CalendarEvent } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EventForm } from "@/components/calendar/EventForm";

type View = "month" | "week";

export default function CalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [formDate, setFormDate] = useState<Date | undefined>();

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .order("start_time");
    setEvents(data ?? []);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (data: Partial<CalendarEvent>) => {
    if (!user) return;
    if (editing) {
      await supabase.from("calendar_events").update(data).eq("id", editing.id);
    } else {
      await supabase
        .from("calendar_events")
        .insert({ ...data, user_id: user.id });
    }
    setEditing(null);
    await load();
  };

  const remove = async () => {
    if (!editing) return;
    await supabase.from("calendar_events").delete().eq("id", editing.id);
    setEditing(null);
    await load();
  };

  const days = useMemo(() => {
    if (view === "month") {
      const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
      const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
      return eachDayOfInterval({ start, end });
    }
    const start = startOfWeek(cursor, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end: endOfWeek(start, { weekStartsOn: 0 }) });
  }, [cursor, view]);

  const eventsByDay = useCallback(
    (day: Date) =>
      events
        .filter((e) => isSameDay(new Date(e.start_time), day))
        .sort(
          (a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        ),
    [events]
  );

  const upcoming = useMemo(() => {
    const now = Date.now();
    return events
      .filter((e) => new Date(e.start_time).getTime() >= now)
      .slice(0, 6);
  }, [events]);

  const navigate = (dir: -1 | 1) =>
    setCursor((c) => (view === "month" ? addMonths(c, dir) : addWeeks(c, dir)));

  const openNew = (day?: Date) => {
    setEditing(null);
    setFormDate(day);
    setFormOpen(true);
  };
  const openEdit = (ev: CalendarEvent) => {
    setEditing(ev);
    setFormDate(undefined);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Your time, color-coded."
        action={
          <Button onClick={() => openNew()}>
            <Plus size={16} /> New Event
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <Card delay={0.1} className="lg:col-span-3">
          {/* Controls */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="rounded-lg p-1.5 text-white/55 hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="min-w-[160px] text-center text-sm font-semibold text-white">
                {view === "month"
                  ? format(cursor, "MMMM yyyy")
                  : `${format(days[0], "MMM d")} – ${format(
                      days[6],
                      "MMM d"
                    )}`}
              </span>
              <button
                onClick={() => navigate(1)}
                className="rounded-lg p-1.5 text-white/55 hover:bg-white/10 hover:text-white"
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => setCursor(new Date())}
                className="ml-1 rounded-lg px-2.5 py-1 text-xs font-medium text-white/55 hover:bg-white/10 hover:text-white"
              >
                Today
              </button>
            </div>
            <div className="flex rounded-[10px] bg-white/[0.04] p-1">
              {(["month", "week"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition-colors ${
                    view === v
                      ? "bg-accent text-white"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Weekday header */}
          <div className="mb-1 grid grid-cols-7 gap-1.5">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="py-1 text-center text-[11px] font-medium text-white/40"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
              const dayEvents = eventsByDay(day);
              const inMonth = view === "week" || isSameMonth(day, cursor);
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => openNew(day)}
                  className={`group cursor-pointer rounded-[10px] border border-surface-border p-1.5 transition-colors hover:border-accent/40 ${
                    view === "month" ? "min-h-[92px]" : "min-h-[220px]"
                  } ${inMonth ? "bg-white/[0.02]" : "bg-transparent opacity-40"}`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                        isToday(day)
                          ? "bg-accent text-white"
                          : "text-white/55"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayEvents
                      .slice(0, view === "month" ? 3 : 12)
                      .map((ev) => (
                        <button
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(ev);
                          }}
                          className="block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium"
                          style={{
                            backgroundColor: `${EVENT_COLORS[ev.category]}22`,
                            color: EVENT_COLORS[ev.category],
                          }}
                        >
                          {format(new Date(ev.start_time), "HH:mm")} {ev.title}
                        </button>
                      ))}
                    {dayEvents.length > (view === "month" ? 3 : 12) && (
                      <span className="px-1.5 text-[10px] text-white/40">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Upcoming */}
        <Card delay={0.15}>
          <CardHeader
            title="Upcoming"
            subtitle="Next events"
            icon={<CalendarClock size={16} />}
          />
          {upcoming.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/40">
              No upcoming events.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {upcoming.map((ev) => (
                <li key={ev.id}>
                  <button
                    onClick={() => openEdit(ev)}
                    className="flex w-full items-start gap-2.5 rounded-[10px] border border-surface-border bg-white/[0.02] p-2.5 text-left transition-colors hover:border-white/20"
                  >
                    <span
                      className="mt-0.5 h-8 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: EVENT_COLORS[ev.category] }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {ev.title}
                      </p>
                      <p className="text-xs text-white/45">
                        {format(new Date(ev.start_time), "EEE, MMM d · h:mm a")}
                      </p>
                      <Badge
                        color={EVENT_COLORS[ev.category]}
                        className="mt-1.5"
                      >
                        <span className="capitalize">{ev.category}</span>
                      </Badge>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <EventForm
        key={editing?.id ?? formDate?.toISOString() ?? "new"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={save}
        onDelete={editing ? remove : undefined}
        initial={editing}
        defaultDate={formDate}
      />
    </div>
  );
}
