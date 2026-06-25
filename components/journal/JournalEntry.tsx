"use client";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { MOOD_COLORS, type JournalEntry as Entry } from "@/lib/types";

export function JournalEntryItem({
  entry,
  active,
  onSelect,
  onDelete,
}: {
  entry: Entry;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const preview =
    entry.content.trim().slice(0, 80) || "Empty entry";
  return (
    <button
      onClick={onSelect}
      className={`group w-full rounded-[10px] border p-3 text-left transition-all ${
        active
          ? "border-accent/50 bg-accent-muted"
          : "border-surface-border bg-white/[0.02] hover:border-white/20"
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-white/55">
          {format(new Date(entry.created_at), "MMM d, yyyy · h:mm a")}
        </span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-white/25 opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
        >
          <Trash2 size={13} />
        </span>
      </div>
      <p className="line-clamp-2 text-sm text-white/75">{preview}</p>
      {entry.mood && (
        <span
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium"
          style={{ color: MOOD_COLORS[entry.mood] }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: MOOD_COLORS[entry.mood] }}
          />
          {entry.mood}
        </span>
      )}
    </button>
  );
}
