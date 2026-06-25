"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Target, Trophy, TrendingUp, ListChecks } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  CATEGORY_COLORS,
  type Goal,
  type GoalCategory,
} from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalForm } from "@/components/goals/GoalForm";

const FILTERS: { value: "all" | GoalCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "career", label: "Career" },
  { value: "health", label: "Health" },
  { value: "financial", label: "Financial" },
  { value: "personal", label: "Personal" },
];

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<"all" | GoalCategory>("all");

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setGoals(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (data: Partial<Goal>) => {
    if (!user) return;
    if (editing) {
      await supabase.from("goals").update(data).eq("id", editing.id);
    } else {
      await supabase.from("goals").insert({ ...data, user_id: user.id });
    }
    setEditing(null);
    await load();
  };

  const remove = async (g: Goal) => {
    if (!confirm(`Delete goal "${g.title}"?`)) return;
    await supabase.from("goals").delete().eq("id", g.id);
    await load();
  };

  const toggleMilestone = async (g: Goal, milestoneId: string) => {
    const milestones = g.milestones.map((m) =>
      m.id === milestoneId ? { ...m, done: !m.done } : m
    );
    const done = milestones.filter((m) => m.done).length;
    // auto-sync progress to milestone completion when milestones exist
    const progress =
      milestones.length > 0
        ? Math.round((done / milestones.length) * 100)
        : g.progress;
    setGoals((arr) =>
      arr.map((x) => (x.id === g.id ? { ...x, milestones, progress } : x))
    );
    await supabase
      .from("goals")
      .update({ milestones, progress })
      .eq("id", g.id);
  };

  const visible = useMemo(
    () => (filter === "all" ? goals : goals.filter((g) => g.category === filter)),
    [goals, filter]
  );

  const stats = useMemo(() => {
    const active = goals.filter((g) => g.status === "active");
    const completed = goals.filter((g) => g.status === "completed").length;
    const avg = active.length
      ? Math.round(active.reduce((s, g) => s + g.progress, 0) / active.length)
      : 0;
    const milestonesDone = goals.reduce(
      (s, g) => s + g.milestones.filter((m) => m.done).length,
      0
    );
    return { active: active.length, completed, avg, milestonesDone };
  }, [goals]);

  const chartData = useMemo(
    () =>
      goals
        .filter((g) => g.status === "active")
        .map((g) => ({
          name: g.title.length > 14 ? g.title.slice(0, 13) + "…" : g.title,
          progress: g.progress,
          color: CATEGORY_COLORS[g.category],
        })),
    [goals]
  );

  return (
    <div>
      <PageHeader
        title="Goals & Progress"
        subtitle="Track what matters and watch it move."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus size={16} /> New Goal
          </Button>
        }
      />

      {/* Stats strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Target size={16} />}
          label="Active goals"
          value={stats.active}
          color="#6366F1"
        />
        <StatCard
          icon={<TrendingUp size={16} />}
          label="Avg progress"
          value={`${stats.avg}%`}
          color="#22D3EE"
        />
        <StatCard
          icon={<Trophy size={16} />}
          label="Completed"
          value={stats.completed}
          color="#34D399"
        />
        <StatCard
          icon={<ListChecks size={16} />}
          label="Milestones done"
          value={stats.milestonesDone}
          color="#EC4899"
        />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card delay={0.1} className="mb-6">
          <CardHeader
            title="Progress by goal"
            subtitle="Active goals, color-coded by category"
            icon={<TrendingUp size={16} />}
          />
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, bottom: 0, left: -24 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{
                    background: "#15151f",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v}%`, "Progress"]}
                />
                <Bar dataKey="progress" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === f.value
                ? "bg-accent text-white"
                : "bg-white/[0.04] text-white/55 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-card bg-white/[0.03]"
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Target size={28} className="mb-3 text-white/25" />
          <p className="text-sm text-white/50">
            {goals.length === 0
              ? "No goals yet. Create your first one."
              : "No goals in this category."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visible.map((g, i) => (
            <GoalCard
              key={g.id}
              goal={g}
              delay={i * 0.04}
              onEdit={(goal) => {
                setEditing(goal);
                setFormOpen(true);
              }}
              onDelete={remove}
              onToggleMilestone={toggleMilestone}
            />
          ))}
        </div>
      )}

      <GoalForm
        key={editing?.id ?? "new"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={save}
        initial={editing}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="glass flex items-center gap-3 p-4">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}22`, color }}
      >
        {icon}
      </span>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/45">{label}</p>
      </div>
    </div>
  );
}
