"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Biodata } from "@/lib/types";

export function BiodataForm({
  initial,
  onSave,
}: {
  initial: Biodata;
  onSave: (b: Biodata) => Promise<void>;
}) {
  const [bio, setBio] = useState<Biodata>(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof Biodata>(k: K, v: Biodata[K]) =>
    setBio((b) => ({ ...b, [k]: v }));

  const num = (v: string) => (v === "" ? undefined : Number(v));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await onSave(bio);
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Input
          label="Age"
          type="number"
          value={bio.age ?? ""}
          onChange={(e) => set("age", num(e.target.value))}
        />
        <Input
          label="Height (cm)"
          type="number"
          value={bio.height ?? ""}
          onChange={(e) => set("height", num(e.target.value))}
        />
        <Input
          label="Weight (kg)"
          type="number"
          step="0.1"
          value={bio.weight ?? ""}
          onChange={(e) => set("weight", num(e.target.value))}
        />
        <Input
          label="Body fat %"
          type="number"
          step="0.1"
          value={bio.bodyFat ?? ""}
          onChange={(e) => set("bodyFat", num(e.target.value))}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          label="Primary goal"
          value={bio.primaryGoal ?? "muscle gain"}
          onChange={(e) => set("primaryGoal", e.target.value as Biodata["primaryGoal"])}
          options={[
            { value: "muscle gain", label: "Muscle gain" },
            { value: "fat loss", label: "Fat loss" },
            { value: "recomposition", label: "Recomposition" },
            { value: "performance", label: "Performance" },
          ]}
        />
        <Select
          label="Training experience"
          value={bio.experience ?? "beginner"}
          onChange={(e) => set("experience", e.target.value as Biodata["experience"])}
          options={[
            { value: "beginner", label: "Beginner" },
            { value: "intermediate", label: "Intermediate" },
            { value: "advanced", label: "Advanced" },
          ]}
        />
        <Select
          label="Days per week"
          value={String(bio.daysPerWeek ?? 4)}
          onChange={(e) => set("daysPerWeek", Number(e.target.value))}
          options={[1, 2, 3, 4, 5, 6, 7].map((n) => ({
            value: String(n),
            label: `${n} day${n > 1 ? "s" : ""}`,
          }))}
        />
        <Select
          label="Equipment"
          value={bio.equipment ?? "gym"}
          onChange={(e) => set("equipment", e.target.value as Biodata["equipment"])}
          options={[
            { value: "home", label: "Home" },
            { value: "gym", label: "Gym" },
            { value: "both", label: "Both" },
          ]}
        />
      </div>

      <Input
        label="Injuries / limitations"
        placeholder="e.g. left knee — avoid deep squats"
        value={bio.limitations ?? ""}
        onChange={(e) => set("limitations", e.target.value)}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saved ? "Saved" : "Save biodata"}
        </Button>
      </div>
    </form>
  );
}
