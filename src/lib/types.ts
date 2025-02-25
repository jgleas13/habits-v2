export type HabitFrequency = 'daily' | 'weekly' | 'monthly';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type HabitStatus = 'unknown' | 'success' | 'failed' | 'skipped';

export interface Habit {
  id: number;
  name: string;
  user_id: string;
  created_at: string;
  frequency: HabitFrequency;
  repeat_days: DayOfWeek[];
  start_date: string; // ISO date string
  time_of_day: string; // Time string
  goal: number;
  archived: boolean;
  status?: HabitStatus; // Used for UI, not stored in habits table
}

export interface HabitCompletion {
  id: number;
  habit_id: number;
  user_id: string;
  completion_date: string; // ISO date string
  status: HabitStatus;
  completed_at: string | null; // ISO datetime string
  notes: string | null;
}

export interface HabitWithCompletion extends Habit {
  completion?: HabitCompletion;
} 