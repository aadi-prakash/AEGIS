"use client";

import { format } from "date-fns";
import { Pencil, Trash2, CalendarDays, CheckCircle2 } from "lucide-react";
import { CATEGORY_COLORS, type Goal } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressRing } from "./ProgressRing";

export function GoalCard({
  goal,
  delay,
  onEdit,
  onDelete,
  onToggleMilestone,
}: {
  goal: Goal;
  delay?: number;
  onEdit: (g: Goal) => void;
  onDelete: (g: Goal) => void;
  onToggleMilestone: (g: Goal, milestoneId: string) => void;
}) {
  const color = CATEGORY_COLORS[goal.category];
  const doneCount = goal.milestones.filter((m) => m.done).length;

  return (
    <Card hover delay={delay} className="flex flex-col">
      <div className="flex items-start gap-4">
        <ProgressRing progress={goal.progress} color={color} size={84} />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold leading-snug text-white">
              {goal.title}
            </h3>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => onEdit(goal)}
                className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(goal)}
                className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-rose-500/15 hover:text-rose-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={color}>
              <span className="capitalize">{goal.category}</span>
            </Badge>
            {goal.status !== "active" && (
              <Badge
                color={goal.status === "completed" ? "#34D399" : "#94A3B8"}
              >
                <span className="capitalize">{goal.status}</span>
              </Badge>
            )}
            {goal.target_date && (
              <span className="inline-flex items-center gap-1 text-xs text-white/40">
                <CalendarDays size={12} />
                {format(new Date(goal.target_date), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </div>
      </div>

      {goal.milestones.length > 0 && (
        <div className="mt-4 border-t border-surface-border pt-3">
          <p className="mb-2 text-xs font-medium text-white/45">
            Milestones · {doneCount}/{goal.milestones.length}
          </p>
          <ul className="space-y-1.5">
            {goal.milestones.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => onToggleMilestone(goal, m.id)}
                  className="flex w-full items-center gap-2 text-left text-sm"
                >
                  <CheckCircle2
                    size={15}
                    className={
                      m.done ? "text-emerald-400" : "text-white/25"
                    }
                  />
                  <span
                    className={
                      m.done
                        ? "text-white/40 line-through"
                        : "text-white/75"
                    }
                  >
                    {m.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
