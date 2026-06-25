"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  NotebookPen,
  Flame,
  Trophy,
  Smile,
  Check,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  MOODS,
  MOOD_COLORS,
  type JournalEntry,
  type Mood,
} from "@/lib/types";
import { isoDate } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { MoodSelector } from "@/components/journal/MoodSelector";
import { ContributionHeatmap } from "@/components/journal/ContributionHeatmap";
import { JournalEntryItem } from "@/components/journal/JournalEntry";

type SaveState = "idle" | "saving" | "saved";

export default function JournalPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState<Mood | "all">("all");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setEntries(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounced auto-save
  const scheduleSave = useCallback(
    (nextContent: string, nextMood: Mood | null) => {
      if (!user) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSaveState("saving");
      debounceRef.current = setTimeout(async () => {
        const id = activeIdRef.current;
        if (id) {
          await supabase
            .from("journal_entries")
            .update({
              content: nextContent,
              mood: nextMood,
              updated_at: new Date().toISOString(),
            })
            .eq("id", id);
          setEntries((arr) =>
            arr.map((e) =>
              e.id === id
                ? { ...e, content: nextContent, mood: nextMood }
                : e
            )
          );
        } else {
          if (!nextContent.trim() && !nextMood) {
            setSaveState("idle");
            return;
          }
          const { data } = await supabase
            .from("journal_entries")
            .insert({
              user_id: user.id,
              content: nextContent,
              mood: nextMood,
            })
            .select()
            .single();
          if (data) {
            setActiveId(data.id);
            setEntries((arr) => [data, ...arr]);
          }
        }
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1500);
      }, 800);
    },
    [user]
  );

  const onContentChange = (v: string) => {
    setContent(v);
    scheduleSave(v, mood);
  };
  const onMoodChange = (m: Mood | null) => {
    setMood(m);
    scheduleSave(content, m);
  };

  const newEntry = () => {
    setActiveId(null);
    setContent("");
    setMood(null);
    setSaveState("idle");
  };

  const selectEntry = (e: JournalEntry) => {
    setActiveId(e.id);
    setContent(e.content);
    setMood(e.mood);
    setSaveState("idle");
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await supabase.from("journal_entries").delete().eq("id", id);
    if (activeId === id) newEntry();
    setEntries((arr) => arr.filter((e) => e.id !== id));
  };

  // Filtering
  const visible = useMemo(() => {
    return entries.filter((e) => {
      const matchesSearch =
        !search ||
        e.content.toLowerCase().includes(search.toLowerCase());
      const matchesMood = moodFilter === "all" || e.mood === moodFilter;
      return matchesSearch && matchesMood;
    });
  }, [entries, search, moodFilter]);

  // Stats
  const stats = useMemo(() => {
    const days = Array.from(
      new Set(entries.map((e) => isoDate(new Date(e.created_at))))
    ).sort();
    // streaks
    let longest = 0;
    let run = 0;
    let prev: Date | null = null;
    for (const d of days) {
      const cur = new Date(d);
      if (prev && (cur.getTime() - prev.getTime()) / 86400000 === 1) run += 1;
      else run = 1;
      longest = Math.max(longest, run);
      prev = cur;
    }
    // current streak counting back from today
    let current = 0;
    const set = new Set(days);
    let cursor = new Date();
    while (set.has(isoDate(cursor))) {
      current += 1;
      cursor = new Date(cursor.getTime() - 86400000);
    }
    // most common mood
    const moodCounts = new Map<Mood, number>();
    entries.forEach((e) => {
      if (e.mood) moodCounts.set(e.mood, (moodCounts.get(e.mood) ?? 0) + 1);
    });
    let topMood: Mood | null = null;
    let max = 0;
    moodCounts.forEach((c, m) => {
      if (c > max) {
        max = c;
        topMood = m;
      }
    });
    return {
      total: entries.length,
      current,
      longest,
      topMood,
    };
  }, [entries]);

  const entryDates = useMemo(
    () => entries.map((e) => isoDate(new Date(e.created_at))),
    [entries]
  );

  return (
    <div>
      <PageHeader
        title="Journal"
        subtitle="Capture the day. Build the habit."
        action={
          <Button onClick={newEntry}>
            <Plus size={16} /> New Entry
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={<NotebookPen size={16} />} label="Total entries" value={stats.total} color="#6366F1" />
        <Stat icon={<Flame size={16} />} label="Current streak" value={`${stats.current}d`} color="#F59E0B" />
        <Stat icon={<Trophy size={16} />} label="Longest streak" value={`${stats.longest}d`} color="#22D3EE" />
        <Stat
          icon={<Smile size={16} />}
          label="Top mood"
          value={stats.topMood ?? "—"}
          color={stats.topMood ? MOOD_COLORS[stats.topMood] : "#94A3B8"}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Editor */}
        <div className="lg:col-span-2">
          <Card delay={0.1} className="flex h-full flex-col">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">
                {activeId ? "Editing entry" : "New entry"}
              </p>
              <SaveIndicator state={saveState} />
            </div>
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="What's on your mind today?"
              className="min-h-[340px] flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-white/90 outline-none placeholder:text-white/30"
            />
            <div className="mt-4 border-t border-surface-border pt-4">
              <p className="mb-2 text-xs font-medium text-white/45">
                How are you feeling?
              </p>
              <MoodSelector value={mood} onChange={onMoodChange} size="sm" />
            </div>
          </Card>
        </div>

        {/* Sidebar: heatmap + entries */}
        <div className="space-y-5">
          <Card delay={0.15}>
            <CardHeader
              title="Consistency"
              subtitle="Last 26 weeks"
              icon={<Flame size={16} />}
            />
            <ContributionHeatmap dates={entryDates} />
          </Card>

          <Card delay={0.2}>
            <div className="mb-3 space-y-2">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search entries…"
                  className="input-base pl-9"
                />
              </div>
              <select
                value={moodFilter}
                onChange={(e) =>
                  setMoodFilter(e.target.value as Mood | "all")
                }
                className="input-base cursor-pointer"
              >
                <option value="all" className="bg-[#15151f]">
                  All moods
                </option>
                {MOODS.map((m) => (
                  <option key={m} value={m} className="bg-[#15151f]">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {loading ? (
                <p className="py-6 text-center text-sm text-white/40">
                  Loading…
                </p>
              ) : visible.length === 0 ? (
                <p className="py-6 text-center text-sm text-white/40">
                  No entries found.
                </p>
              ) : (
                visible.map((e) => (
                  <JournalEntryItem
                    key={e.id}
                    entry={e}
                    active={e.id === activeId}
                    onSelect={() => selectEntry(e)}
                    onDelete={() => deleteEntry(e.id)}
                  />
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-white/40">
        <Loader2 size={13} className="animate-spin" /> Saving…
      </span>
    );
  if (state === "saved")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
        <Check size={13} /> Saved
      </span>
    );
  return <span className="text-xs text-white/30">Auto-saves as you type</span>;
}

function Stat({
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
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-white">{value}</p>
        <p className="text-xs text-white/45">{label}</p>
      </div>
    </div>
  );
}
