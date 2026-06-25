"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/goals/ProgressRing";
import type { Nutrition } from "@/lib/types";

// Macro calories: protein 4, carbs 4, fats 9
const KCAL = { protein: 4, carbs: 4, fats: 9 };

export function NutritionRings({
  initial,
  onSave,
}: {
  initial: Nutrition;
  onSave: (n: Nutrition) => Promise<void>;
}) {
  const [n, setN] = useState<Nutrition>(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof Nutrition, v: string) =>
    setN((prev) => ({ ...prev, [k]: v === "" ? undefined : Number(v) }));

  const num = (v?: number) => v ?? 0;
  const macroKcal =
    num(n.protein) * KCAL.protein +
    num(n.carbs) * KCAL.carbs +
    num(n.fats) * KCAL.fats;

  // % of total calorie target that each macro contributes
  const pct = (kcal: number) =>
    n.calories && n.calories > 0
      ? Math.min(100, Math.round((kcal / n.calories) * 100))
      : 0;

  const rings = [
    {
      label: "Protein",
      grams: num(n.protein),
      color: "#6366F1",
      value: pct(num(n.protein) * KCAL.protein),
    },
    {
      label: "Carbs",
      grams: num(n.carbs),
      color: "#22D3EE",
      value: pct(num(n.carbs) * KCAL.carbs),
    },
    {
      label: "Fats",
      grams: num(n.fats),
      color: "#F59E0B",
      value: pct(num(n.fats) * KCAL.fats),
    },
  ];

  const save = async () => {
    setBusy(true);
    await onSave(n);
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-around gap-4">
        <ProgressRing
          progress={
            n.calories ? Math.min(100, (macroKcal / n.calories) * 100) : 0
          }
          color="#34D399"
          size={108}
          stroke={9}
          label={n.calories ? String(n.calories) : "—"}
          sublabel="kcal target"
        />
        {rings.map((r) => (
          <div key={r.label} className="flex flex-col items-center gap-1.5">
            <ProgressRing
              progress={r.value}
              color={r.color}
              size={84}
              label={`${r.grams}g`}
            />
            <span className="text-xs font-medium text-white/55">{r.label}</span>
          </div>
        ))}
      </div>

      {n.calories && macroKcal > n.calories ? (
        <p className="text-center text-xs text-amber-400">
          Macros total {macroKcal} kcal — over your {n.calories} kcal target.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Input
          label="Calories"
          type="number"
          value={n.calories ?? ""}
          onChange={(e) => set("calories", e.target.value)}
        />
        <Input
          label="Protein (g)"
          type="number"
          value={n.protein ?? ""}
          onChange={(e) => set("protein", e.target.value)}
        />
        <Input
          label="Carbs (g)"
          type="number"
          value={n.carbs ?? ""}
          onChange={(e) => set("carbs", e.target.value)}
        />
        <Input
          label="Fats (g)"
          type="number"
          value={n.fats ?? ""}
          onChange={(e) => set("fats", e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={busy}>
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saved ? "Saved" : "Save nutrition"}
        </Button>
      </div>
    </div>
  );
}
