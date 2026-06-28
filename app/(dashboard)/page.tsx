"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Target,
  NotebookPen,
  CalendarDays,
  Dumbbell,
  ArrowRight,
  Smile,
  Activity,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { greeting, isoDate } from "@/lib/utils";
import type {
  CalendarEvent,
  Goal,
  JournalEntry,
  FitnessProfile,
  WorkoutDay,
} from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { AgendaWidget } from "@/components/dashboard/AgendaWidget";
import { GoalSnapshot } from "@/components/dashboard/GoalSnapshot";
import { MoodBadge } from "@/components/dashboard/MoodBadge";

const QUICK_LINKS = [
  { href: "/goals", label: "Goals", icon: Target, color: "#6366F1" },
  { href: "/journal", label: "Journal", icon: NotebookPen, color: "#22D3EE" },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, color: "#EC4899" },
  { href: "/fitness", label: "Fitness", icon: Dumbbell, color: "#F59E0B" },
];

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function DashboardHome() {
  const { user, name } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [latestEntry, setLatestEntry] = useState<JournalEntry | null>(null);
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const [ev, gl, je, fp] = await Promise.all([
        supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", user.id)
          .gte("start_time", todayStart.toISOString())
          .lte("start_time", todayEnd.toISOString())
          .order("start_time"),
        supabase
          .from("goals")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("progress", { ascending: false })
          .limit(3),
        supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("fitness_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      setEvents(ev.data ?? []);
      setGoals(gl.data ?? []);
      setLatestEntry(je.data ?? null);
      setProfile(fp.data ?? null);
      setLoading(false);
    };
    load();
  }, [user]);

  const todayName = WEEKDAYS[new Date().getDay()];
  const todaysWorkout: WorkoutDay | undefined = profile?.workout_plan?.days?.find(
    (d) => d.day.toLowerCase() === todayName.toLowerCase()
  );

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-light tracking-tight text-white/85">
          {greeting()}, <span className="font-medium text-white">{name}</span>
        </h1>
        <p className="mt-2 text-[11px] uppercase tracking-[0.07em] text-white/35">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </motion.div>

      {/* Quick access */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_LINKS.map((q, i) => (
          <motion.div
            key={q.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={q.href}
              className="glass glass-hover group flex items-center gap-3 p-4"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${q.color}22`, color: q.color }}
              >
                <q.icon size={20} />
              </span>
              <span className="text-sm font-medium text-white">{q.label}</span>
              <ArrowRight
                size={16}
                className="ml-auto text-white/25 transition-all group-hover:translate-x-0.5 group-hover:text-white/60"
              />
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Agenda */}
        <Card delay={0.1} className="lg:col-span-2">
          <CardHeader
            title="Today's Agenda"
            subtitle="Events scheduled for today"
            icon={<CalendarDays size={16} />}
            action={
              <Link
                href="/calendar"
                className="text-xs font-medium text-accent hover:text-accent-hover"
              >
                View all
              </Link>
            }
          />
          {loading ? (
            <Skeleton rows={3} />
          ) : (
            <AgendaWidget events={events} />
          )}
        </Card>

        {/* Mood */}
        <Card delay={0.15}>
          <CardHeader
            title="Latest Mood"
            subtitle="From your journal"
            icon={<Smile size={16} />}
          />
          {loading ? (
            <Skeleton rows={2} />
          ) : (
            <div className="space-y-3">
              <MoodBadge mood={latestEntry?.mood ?? null} />
              {latestEntry?.content ? (
                <p className="line-clamp-4 text-sm leading-relaxed text-white/55">
                  {latestEntry.content}
                </p>
              ) : (
                <p className="text-sm text-white/40">
                  Write your first entry to track your mood.
                </p>
              )}
              <Link
                href="/journal"
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
              >
                Open journal <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </Card>

        {/* Goals */}
        <Card delay={0.2} className="lg:col-span-2">
          <CardHeader
            title="Active Goals"
            subtitle="Top 3 by progress"
            icon={<Target size={16} />}
            action={
              <Link
                href="/goals"
                className="text-xs font-medium text-accent hover:text-accent-hover"
              >
                View all
              </Link>
            }
          />
          {loading ? <Skeleton rows={3} /> : <GoalSnapshot goals={goals} />}
        </Card>

        {/* Today's workout */}
        <Card delay={0.25}>
          <CardHeader
            title="Today's Workout"
            subtitle={todayName}
            icon={<Activity size={16} />}
          />
          {loading ? (
            <Skeleton rows={2} />
          ) : todaysWorkout ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-cyan">
                {todaysWorkout.focus || todaysWorkout.day}
              </p>
              <ul className="space-y-1.5">
                {todaysWorkout.exercises.slice(0, 4).map((ex) => (
                  <li
                    key={ex.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate text-white/70">{ex.name}</span>
                    <span className="shrink-0 text-xs text-white/40">
                      {ex.sets}×{ex.reps}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/fitness"
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
              >
                Open plan <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-white/40">
                {profile
                  ? "Rest day — nothing programmed."
                  : "Set up your fitness plan to see today's workout."}
              </p>
              <Link
                href="/fitness"
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
              >
                Go to fitness <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-9 animate-pulse rounded-lg bg-white/[0.04]"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}
