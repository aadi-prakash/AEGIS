"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { CalendarEvent, EventCategory } from "@/lib/types";

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "work", label: "Work" },
  { value: "gym", label: "Gym" },
  { value: "personal", label: "Personal" },
  { value: "deadlines", label: "Deadlines" },
];

// build a value suitable for <input type="datetime-local"> from ISO / Date
function toLocalInput(d: Date): string {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

export function EventForm({
  open,
  onClose,
  onSave,
  onDelete,
  initial,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<CalendarEvent>) => Promise<void>;
  onDelete?: () => Promise<void>;
  initial?: CalendarEvent | null;
  defaultDate?: Date;
}) {
  const base = defaultDate ?? new Date();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [start, setStart] = useState(
    toLocalInput(initial ? new Date(initial.start_time) : base)
  );
  const [end, setEnd] = useState(
    initial?.end_time ? toLocalInput(new Date(initial.end_time)) : ""
  );
  const [category, setCategory] = useState<EventCategory>(
    initial?.category ?? "work"
  );
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await onSave({
      title: title.trim(),
      start_time: new Date(start).toISOString(),
      end_time: end ? new Date(end).toISOString() : null,
      category,
    });
    setBusy(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Event" : "New Event"}
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Title"
          placeholder="Team standup"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Starts"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
          <Input
            label="Ends (optional)"
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as EventCategory)}
          options={CATEGORIES}
        />
        <div className="flex items-center justify-between pt-2">
          {initial && onDelete ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={async () => {
                await onDelete();
                onClose();
              }}
            >
              <Trash2 size={15} /> Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !title.trim()}>
              {busy && <Loader2 size={16} className="animate-spin" />}
              {initial ? "Save" : "Add event"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
