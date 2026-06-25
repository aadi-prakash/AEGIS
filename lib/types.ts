// ============================================================
// Domain types + a minimal Supabase Database typing
// ============================================================

export type GoalCategory = "career" | "health" | "financial" | "personal";
export type GoalStatus = "active" | "completed" | "paused";
export type EventCategory = "work" | "gym" | "personal" | "deadlines";

export const MOODS = [
  "Focused",
  "Motivated",
  "Stressed",
  "Tired",
  "Locked In",
  "Reflective",
  "Grateful",
] as const;
export type Mood = (typeof MOODS)[number];

export interface Milestone {
  id: string;
  label: string;
  done: boolean;
}

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  category: GoalCategory;
  target_date: string | null;
  progress: number;
  milestones: Milestone[];
  status: GoalStatus;
  created_at: string;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  content: string;
  mood: Mood | null;
  created_at: string;
  updated_at: string;
};

export type CalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  category: EventCategory;
  created_at: string;
};

// ---- Fitness ----
export type PrimaryGoal =
  | "muscle gain"
  | "fat loss"
  | "recomposition"
  | "performance";
export type Experience = "beginner" | "intermediate" | "advanced";
export type Equipment = "home" | "gym" | "both";

export interface Biodata {
  age?: number;
  height?: number; // cm
  weight?: number; // kg
  bodyFat?: number; // %
  primaryGoal?: PrimaryGoal;
  experience?: Experience;
  daysPerWeek?: number;
  equipment?: Equipment;
  limitations?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

export interface WorkoutDay {
  id: string;
  day: string; // "Monday" / "Push" etc.
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  days: WorkoutDay[];
}

export interface Nutrition {
  calories?: number;
  protein?: number; // grams
  carbs?: number; // grams
  fats?: number; // grams
}

export type FitnessProfile = {
  id: string;
  user_id: string;
  biodata: Biodata;
  workout_plan: WorkoutPlan;
  nutrition: Nutrition;
  created_at: string;
  updated_at: string;
};

export type FitnessLog = {
  id: string;
  user_id: string;
  date: string;
  weight: number | null;
  notes: string | null;
  created_at: string;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
};

// Minimal Database shape for the typed client.
type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      users: TableDef<UserProfile>;
      goals: TableDef<Goal>;
      journal_entries: TableDef<JournalEntry>;
      calendar_events: TableDef<CalendarEvent>;
      fitness_profiles: TableDef<FitnessProfile>;
      fitness_logs: TableDef<FitnessLog>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ---- Shared UI helpers ----
export const CATEGORY_COLORS: Record<GoalCategory, string> = {
  career: "#6366F1",
  health: "#22D3EE",
  financial: "#F59E0B",
  personal: "#EC4899",
};

export const EVENT_COLORS: Record<EventCategory, string> = {
  work: "#6366F1",
  gym: "#22D3EE",
  personal: "#EC4899",
  deadlines: "#F43F5E",
};

export const MOOD_COLORS: Record<Mood, string> = {
  Focused: "#6366F1",
  Motivated: "#22D3EE",
  Stressed: "#F43F5E",
  Tired: "#94A3B8",
  "Locked In": "#A855F7",
  Reflective: "#38BDF8",
  Grateful: "#34D399",
};
