"use client";

import { MOOD_COLORS, type Mood } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

export function MoodBadge({ mood }: { mood: Mood | null }) {
  if (!mood) return <span className="text-sm text-white/40">No mood logged</span>;
  return <Badge color={MOOD_COLORS[mood]}>{mood}</Badge>;
}
