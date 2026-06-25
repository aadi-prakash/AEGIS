"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { uid } from "@/lib/utils";
import type { Goal, GoalCategory, GoalStatus, Milestone } from "@/lib/types";

const CATEGORIES: { value: GoalCategory; label: string }[] = [
  { value: "career", label: "Career" },
  { value: "health", label: "Health" },
  { value: "financial", label: "Financial" },
  { value: "personal", label: "Personal" },
];

const STATUSES: { value: GoalStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
];

export function GoalForm({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Goal>) => Promise<void>;
  initial?: Goal | null;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<GoalCategory>(
    initial?.category ?? "career"
  );
  const [targetDate, setTargetDate] = useState(initial?.target_date ?? "");
  const [status, setStatus] = useState<GoalStatus>(initial?.status ?? "active");
  const [progress, setProgress] = useState(initial?.progress ?? 0);
  const [milestones, setMilestones] = useState<Milestone[]>(
    initial?.milestones ?? []
  );
  const [newMilestone, setNewMilestone] = useState("");
  const [busy, setBusy] = useState(false);

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setMilestones((m) => [
      ...m,
      { id: uid(), label: newMilestone.trim(), done: false },
    ]);
    setNewMilestone("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await onSave({
      title: title.trim(),
      category,
      target_date: targetDate || null,
      status,
      progress,
      milestones,
    });
    setBusy(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Goal" : "New Goal"}>
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Title"
          placeholder="Land a senior engineering role"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as GoalCategory)}
            options={CATEGORIES}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as GoalStatus)}
            options={STATUSES}
          />
        </div>

        <Input
          label="Target date"
          type="date"
          value={targetDate ?? ""}
          onChange={(e) => setTargetDate(e.target.value)}
        />

        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/60">
            Progress — {progress}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-[#6366F1]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/60">
            Milestones
          </label>
          <div className="space-y-2">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 rounded-lg border border-surface-border bg-white/[0.02] px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={m.done}
                  onChange={() =>
                    setMilestones((arr) =>
                      arr.map((x) =>
                        x.id === m.id ? { ...x, done: !x.done } : x
                      )
                    )
                  }
                  className="h-4 w-4 accent-[#22D3EE]"
                />
                <span
                  className={`flex-1 text-sm ${
                    m.done ? "text-white/40 line-through" : "text-white/80"
                  }`}
                >
                  {m.label}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setMilestones((arr) => arr.filter((x) => x.id !== m.id))
                  }
                  className="text-white/30 hover:text-rose-400"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                className="input-base"
                placeholder="Add a milestone"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMilestone();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addMilestone}>
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !title.trim()}>
            {busy && <Loader2 size={16} className="animate-spin" />}
            {initial ? "Save changes" : "Create goal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
