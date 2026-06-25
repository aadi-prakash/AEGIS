"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Save, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { uid } from "@/lib/utils";
import type { Exercise, WorkoutDay, WorkoutPlan } from "@/lib/types";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function WorkoutPlanBuilder({
  initial,
  onSave,
}: {
  initial: WorkoutPlan;
  onSave: (p: WorkoutPlan) => Promise<void>;
}) {
  const [days, setDays] = useState<WorkoutDay[]>(initial.days ?? []);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const addDay = () =>
    setDays((d) => [
      ...d,
      {
        id: uid(),
        day: WEEKDAYS[d.length % 7],
        focus: "",
        exercises: [],
      },
    ]);

  const updateDay = (id: string, patch: Partial<WorkoutDay>) =>
    setDays((d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const removeDay = (id: string) =>
    setDays((d) => d.filter((x) => x.id !== id));

  const addExercise = (dayId: string) =>
    updateExercises(dayId, (ex) => [
      ...ex,
      { id: uid(), name: "", sets: 3, reps: "8-12", rest: "90s" },
    ]);

  const updateExercises = (
    dayId: string,
    fn: (ex: Exercise[]) => Exercise[]
  ) =>
    setDays((d) =>
      d.map((x) => (x.id === dayId ? { ...x, exercises: fn(x.exercises) } : x))
    );

  const save = async () => {
    setBusy(true);
    await onSave({ days });
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-4">
      {days.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-surface-border py-10 text-center">
          <Dumbbell size={24} className="mb-2 text-white/25" />
          <p className="text-sm text-white/45">
            No training days yet. Build your split.
          </p>
        </div>
      )}

      {days.map((day) => (
        <div
          key={day.id}
          className="rounded-[10px] border border-surface-border bg-white/[0.02] p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <select
              value={day.day}
              onChange={(e) => updateDay(day.id, { day: e.target.value })}
              className="input-base w-auto cursor-pointer py-1.5 text-sm font-semibold"
            >
              {WEEKDAYS.map((w) => (
                <option key={w} value={w} className="bg-[#15151f]">
                  {w}
                </option>
              ))}
            </select>
            <input
              value={day.focus}
              onChange={(e) => updateDay(day.id, { focus: e.target.value })}
              placeholder="Focus (e.g. Push / Legs)"
              className="input-base flex-1 py-1.5 text-sm"
            />
            <button
              onClick={() => removeDay(day.id)}
              className="rounded-md p-1.5 text-white/40 hover:bg-rose-500/15 hover:text-rose-400"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {day.exercises.length > 0 && (
            <div className="mb-2 grid grid-cols-[1fr_56px_72px_72px_32px] gap-2 px-1 text-[11px] font-medium text-white/40">
              <span>Exercise</span>
              <span>Sets</span>
              <span>Reps</span>
              <span>Rest</span>
              <span />
            </div>
          )}

          <div className="space-y-2">
            {day.exercises.map((ex) => (
              <div
                key={ex.id}
                className="grid grid-cols-[1fr_56px_72px_72px_32px] gap-2"
              >
                <input
                  value={ex.name}
                  onChange={(e) =>
                    updateExercises(day.id, (arr) =>
                      arr.map((x) =>
                        x.id === ex.id ? { ...x, name: e.target.value } : x
                      )
                    )
                  }
                  placeholder="Bench press"
                  className="input-base py-1.5 text-sm"
                />
                <input
                  type="number"
                  value={ex.sets}
                  onChange={(e) =>
                    updateExercises(day.id, (arr) =>
                      arr.map((x) =>
                        x.id === ex.id
                          ? { ...x, sets: Number(e.target.value) }
                          : x
                      )
                    )
                  }
                  className="input-base py-1.5 text-center text-sm"
                />
                <input
                  value={ex.reps}
                  onChange={(e) =>
                    updateExercises(day.id, (arr) =>
                      arr.map((x) =>
                        x.id === ex.id ? { ...x, reps: e.target.value } : x
                      )
                    )
                  }
                  className="input-base py-1.5 text-center text-sm"
                />
                <input
                  value={ex.rest}
                  onChange={(e) =>
                    updateExercises(day.id, (arr) =>
                      arr.map((x) =>
                        x.id === ex.id ? { ...x, rest: e.target.value } : x
                      )
                    )
                  }
                  className="input-base py-1.5 text-center text-sm"
                />
                <button
                  onClick={() =>
                    updateExercises(day.id, (arr) =>
                      arr.filter((x) => x.id !== ex.id)
                    )
                  }
                  className="flex items-center justify-center text-white/30 hover:text-rose-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => addExercise(day.id)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
          >
            <Plus size={13} /> Add exercise
          </button>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={addDay}>
          <Plus size={16} /> Add training day
        </Button>
        <Button onClick={save} disabled={busy}>
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saved ? "Saved" : "Save plan"}
        </Button>
      </div>
    </div>
  );
}
