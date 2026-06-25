"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import {
  User,
  Dumbbell,
  LineChart as LineChartIcon,
  Apple,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { isoDate } from "@/lib/utils";
import type {
  Biodata,
  FitnessLog,
  FitnessProfile,
  Nutrition,
  WorkoutPlan,
} from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { BiodataForm } from "@/components/fitness/BiodataForm";
import { WorkoutPlanBuilder } from "@/components/fitness/WorkoutPlan";
import { ProgressChart } from "@/components/fitness/ProgressChart";
import { NutritionRings } from "@/components/fitness/NutritionRings";

type Tab = "biodata" | "plan" | "progress" | "nutrition";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "biodata", label: "Biodata", icon: <User size={16} /> },
  { id: "plan", label: "Workout Plan", icon: <Dumbbell size={16} /> },
  { id: "progress", label: "Progress", icon: <LineChartIcon size={16} /> },
  { id: "nutrition", label: "Nutrition", icon: <Apple size={16} /> },
];

export default function FitnessPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("biodata");
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [logs, setLogs] = useState<FitnessLog[]>([]);
  const [loading, setLoading] = useState(true);

  // check-in form
  const [date, setDate] = useState(isoDate());
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [logging, setLogging] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [p, l] = await Promise.all([
      supabase
        .from("fitness_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("fitness_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false }),
    ]);
    setProfile(p.data ?? null);
    setLogs(l.data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Upsert one section of the profile
  const saveProfile = async (
    patch: Partial<Pick<FitnessProfile, "biodata" | "workout_plan" | "nutrition">>
  ) => {
    if (!user) return;
    const payload = {
      user_id: user.id,
      biodata: profile?.biodata ?? {},
      workout_plan: profile?.workout_plan ?? { days: [] },
      nutrition: profile?.nutrition ?? {},
      ...patch,
      updated_at: new Date().toISOString(),
    };
    const { data } = await supabase
      .from("fitness_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();
    if (data) setProfile(data);
  };

  const addLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLogging(true);
    const { data } = await supabase
      .from("fitness_logs")
      .insert({
        user_id: user.id,
        date,
        weight: weight ? Number(weight) : null,
        notes: notes || null,
      })
      .select()
      .single();
    if (data) setLogs((arr) => [data, ...arr]);
    setWeight("");
    setNotes("");
    setLogging(false);
  };

  const deleteLog = async (id: string) => {
    await supabase.from("fitness_logs").delete().eq("id", id);
    setLogs((arr) => arr.filter((l) => l.id !== id));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={26} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Health & Fitness"
        subtitle="Your training command center."
      />

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-accent text-white"
                : "bg-white/[0.04] text-white/55 hover:text-white"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "biodata" && (
        <Card delay={0.05}>
          <CardHeader
            title="Biodata"
            subtitle="Your baseline stats and training profile"
            icon={<User size={16} />}
          />
          <BiodataForm
            initial={profile?.biodata ?? {}}
            onSave={(biodata) => saveProfile({ biodata })}
          />
        </Card>
      )}

      {tab === "plan" && (
        <Card delay={0.05}>
          <CardHeader
            title="Weekly Workout Plan"
            subtitle="Build your split day by day"
            icon={<Dumbbell size={16} />}
          />
          <WorkoutPlanBuilder
            initial={profile?.workout_plan ?? { days: [] }}
            onSave={(workout_plan: WorkoutPlan) => saveProfile({ workout_plan })}
          />
        </Card>
      )}

      {tab === "progress" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card delay={0.05} className="lg:col-span-2">
            <CardHeader
              title="Weight Trend"
              subtitle="Weekly check-ins"
              icon={<LineChartIcon size={16} />}
            />
            <ProgressChart logs={logs} />
          </Card>

          <Card delay={0.1}>
            <CardHeader title="New Check-in" subtitle="Log today's weight" />
            <form onSubmit={addLog} className="space-y-3">
              <Input
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <Input
                label="Weight (kg)"
                type="number"
                step="0.1"
                placeholder="74.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <Textarea
                label="Notes"
                rows={2}
                placeholder="Felt strong, slept well"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={logging}>
                {logging ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Add check-in
              </Button>
            </form>
          </Card>

          <Card delay={0.15} className="lg:col-span-3">
            <CardHeader
              title="Body Stats History"
              subtitle={`${logs.length} entr${logs.length === 1 ? "y" : "ies"}`}
            />
            {logs.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/40">
                No check-ins logged yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-xs text-white/45">
                      <th className="pb-2 pr-4 font-medium">Date</th>
                      <th className="pb-2 pr-4 font-medium">Weight</th>
                      <th className="pb-2 pr-4 font-medium">Notes</th>
                      <th className="pb-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l) => (
                      <tr
                        key={l.id}
                        className="border-b border-surface-border/50 last:border-0"
                      >
                        <td className="py-2.5 pr-4 text-white/80">
                          {format(new Date(l.date), "MMM d, yyyy")}
                        </td>
                        <td className="py-2.5 pr-4 font-medium text-cyan">
                          {l.weight != null ? `${l.weight} kg` : "—"}
                        </td>
                        <td className="py-2.5 pr-4 text-white/55">
                          {l.notes || "—"}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => deleteLog(l.id)}
                            className="text-white/30 hover:text-rose-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "nutrition" && (
        <Card delay={0.05}>
          <CardHeader
            title="Nutrition Targets"
            subtitle="Set your calorie goal and macro split"
            icon={<Apple size={16} />}
          />
          <NutritionRings
            initial={profile?.nutrition ?? {}}
            onSave={(nutrition: Nutrition) => saveProfile({ nutrition })}
          />
        </Card>
      )}
    </div>
  );
}
