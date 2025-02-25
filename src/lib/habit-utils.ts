import { format, parseISO, isAfter, isBefore, isEqual, getDay, eachDayOfInterval, subDays } from 'date-fns';
import { Habit, DayOfWeek, HabitWithCompletion, HabitCompletion } from './types';

// Map JavaScript day number (0-6, starting with Sunday) to our DayOfWeek type
const dayNumberToName: Record<number, DayOfWeek> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
};

/**
 * Determines if a habit should be active on a given date based on its frequency and start date
 */
export function isHabitActiveOnDate(habit: Habit, date: Date): boolean {
  const startDate = parseISO(habit.start_date);
  
  // Check if the date is on or after the start date
  if (isBefore(date, startDate)) {
    return false;
  }
  
  // For daily habits, it's active every day after start date
  if (habit.frequency === 'daily') {
    const dayName = dayNumberToName[getDay(date)];
    return habit.repeat_days.includes(dayName);
  }
  
  // For weekly habits, check if the day of week is in repeat_days
  if (habit.frequency === 'weekly') {
    const dayName = dayNumberToName[getDay(date)];
    return habit.repeat_days.includes(dayName);
  }
  
  // For monthly habits, check if the day of month matches the start date's day
  if (habit.frequency === 'monthly') {
    return date.getDate() === startDate.getDate();
  }
  
  return false;
}

/**
 * Filters habits to only those active on a given date
 */
export function getHabitsForDate(habits: Habit[], date: Date): Habit[] {
  return habits.filter(habit => !habit.archived && isHabitActiveOnDate(habit, date));
}

/**
 * Groups habits by their status for a given date
 */
export function groupHabitsByStatus(habits: HabitWithCompletion[]): {
  pending: HabitWithCompletion[];
  completed: HabitWithCompletion[];
} {
  return {
    pending: habits.filter(habit => 
      !habit.completion || 
      habit.completion.status === 'unknown' || 
      habit.completion.status === 'failed'
    ),
    completed: habits.filter(habit => 
      habit.completion && 
      (habit.completion.status === 'success' || habit.completion.status === 'skipped')
    )
  };
}

/**
 * Formats a date as YYYY-MM-DD for database operations
 */
export function formatDateForDB(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Calculate the current streak for a habit
 */
export function calculateCurrentStreak(
  habit: Habit, 
  completions: HabitCompletion[]
): { days: number; startDate: Date | null } {
  if (!completions.length) {
    return { days: 0, startDate: null };
  }

  // Sort completions by date (newest first)
  const sortedCompletions = [...completions].sort((a, b) => 
    new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime()
  );

  // Find successful completions
  const successfulCompletions = sortedCompletions.filter(c => c.status === 'success');
  
  if (!successfulCompletions.length) {
    return { days: 0, startDate: null };
  }

  let streakDays = 0;
  let startDate: Date | null = null;
  
  // Get the most recent successful completion
  const mostRecentDate = parseISO(successfulCompletions[0].completion_date);
  startDate = mostRecentDate;
  streakDays = 1;
  
  // Check previous days to see if they're part of the streak
  for (let i = 1; i < successfulCompletions.length; i++) {
    const currentDate = parseISO(successfulCompletions[i].completion_date);
    const expectedDate = subDays(parseISO(successfulCompletions[i-1].completion_date), 1);
    
    // If this completion is exactly one day before the previous one, it's part of the streak
    if (format(currentDate, 'yyyy-MM-dd') === format(expectedDate, 'yyyy-MM-dd')) {
      streakDays++;
      startDate = currentDate;
    } else {
      // Streak is broken
      break;
    }
  }
  
  return { days: streakDays, startDate };
}

/**
 * Calculate completion statistics for a habit
 */
export function calculateHabitStats(
  habit: Habit, 
  completions: HabitCompletion[]
) {
  const stats = {
    complete: {
      days: 0,
      trend: '---'
    },
    failed: {
      days: 0,
      trend: '---'
    },
    skipped: {
      days: 0,
      trend: '---'
    },
    total: {
      times: 0,
      trend: '---'
    }
  };
  
  // Count by status
  completions.forEach(completion => {
    if (completion.status === 'success') {
      stats.complete.days++;
      stats.total.times++;
    } else if (completion.status === 'failed') {
      stats.failed.days++;
    } else if (completion.status === 'skipped') {
      stats.skipped.days++;
    }
  });
  
  // Calculate trends (in a real app, you'd compare to previous period)
  if (stats.complete.days > 0) {
    stats.complete.trend = `+${stats.complete.days}`;
  }
  
  if (stats.failed.days > 0) {
    stats.failed.trend = `+${stats.failed.days}`;
  }
  
  if (stats.skipped.days > 0) {
    stats.skipped.trend = `+${stats.skipped.days}`;
  }
  
  if (stats.total.times > 0) {
    stats.total.trend = `+${stats.total.times}`;
  }
  
  return stats;
}

/**
 * Get dates when a habit was completed successfully
 */
export function getCompletedDates(completions: HabitCompletion[]): Date[] {
  return completions
    .filter(completion => completion.status === 'success')
    .map(completion => parseISO(completion.completion_date));
} 