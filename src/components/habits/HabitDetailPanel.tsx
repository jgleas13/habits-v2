"use client";

import { useState, useEffect } from 'react';
import { HabitWithCompletion, HabitCompletion } from '@/lib/types';
import { format, parseISO, addDays, subDays, eachDayOfInterval } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { calculateCurrentStreak, calculateHabitStats, getCompletedDates } from '@/lib/habit-utils';

interface HabitDetailPanelProps {
  habit: HabitWithCompletion | null;
  onClose: () => void;
}

export function HabitDetailPanel({ habit, onClose }: HabitDetailPanelProps) {
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (habit && user) {
      const fetchCompletions = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('habit_completions')
            .select('*')
            .eq('habit_id', habit.id)
            .eq('user_id', user.id);
            
          if (error) throw error;
          setCompletions(data || []);
        } catch (err) {
          console.error('Error fetching completions:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchCompletions();
    }
  }, [habit, user]);

  if (!habit) return null;

  // Calculate streak and stats
  const streak = calculateCurrentStreak(habit, completions);
  const stats = calculateHabitStats(habit, completions);
  const completedDates = getCompletedDates(completions);

  // Generate calendar days for the current month
  const today = new Date();
  const calendarDays = [
    { day: 'Su', label: 'Su' },
    { day: 'Mo', label: 'Mo' },
    { day: 'Tu', label: 'Tu' },
    { day: 'We', label: 'We' },
    { day: 'Th', label: 'Th' },
    { day: 'Fr', label: 'Fr' },
    { day: 'Sa', label: 'Sa' }
  ];

  // Generate dates for the calendar (4 weeks)
  const startDate = subDays(today, 15); // Start 2 weeks ago
  const endDate = addDays(today, 12); // End 2 weeks from now
  
  const calendarDates = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Group dates by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  calendarDates.forEach((date) => {
    currentWeek.push(date);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const isDateCompleted = (date: Date) => {
    return completedDates.some(completedDate => 
      format(completedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const isToday = (date: Date) => {
    return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg border-l border-gray-200 overflow-y-auto z-10">
      <div className="p-6">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{habit.name}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            {/* Current Streak */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-gray-500">CURRENT STREAK</div>
                {streak.startDate && (
                  <div className="text-sm text-gray-500">FROM {format(streak.startDate, 'MMM dd, yyyy').toUpperCase()}</div>
                )}
              </div>
              <div className="flex items-center">
                <div className="text-orange-500 mr-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
                  </svg>
                </div>
                <div className="text-2xl font-bold">{streak.days} {streak.days === 1 ? 'day' : 'days'}</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Complete */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-1">
                  <svg className="w-5 h-5 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="text-sm font-medium text-gray-500">COMPLETE</div>
                </div>
                <div className="text-xl font-bold">{stats.complete.days} {stats.complete.days === 1 ? 'day' : 'days'}</div>
                <div className="text-sm text-green-500">{stats.complete.trend}</div>
              </div>

              {/* Failed */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-1">
                  <svg className="w-5 h-5 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div className="text-sm font-medium text-gray-500">FAILED</div>
                </div>
                <div className="text-xl font-bold">{stats.failed.days} {stats.failed.days === 1 ? 'day' : 'days'}</div>
                <div className="text-sm text-gray-500">{stats.failed.trend}</div>
              </div>

              {/* Skipped */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-1">
                  <svg className="w-5 h-5 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  <div className="text-sm font-medium text-gray-500">SKIPPED</div>
                </div>
                <div className="text-xl font-bold">{stats.skipped.days} {stats.skipped.days === 1 ? 'day' : 'days'}</div>
                <div className="text-sm text-red-500">{stats.skipped.trend}</div>
              </div>

              {/* Total */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-1">
                  <div className="text-sm font-medium text-gray-500">TOTAL</div>
                </div>
                <div className="text-xl font-bold">{stats.total.times} {stats.total.times === 1 ? 'time' : 'times'}</div>
                <div className="text-sm text-green-500">{stats.total.trend}</div>
              </div>
            </div>

            {/* Calendar */}
            <div>
              <div className="mb-2">
                <div className="grid grid-cols-7 text-center">
                  {calendarDays.map((day) => (
                    <div key={day.day} className="text-xs font-medium text-gray-500">
                      {day.label}
                    </div>
                  ))}
                </div>
              </div>

              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1 mb-1">
                  {week.map((date, dateIndex) => {
                    const isCompleted = isDateCompleted(date);
                    const isTodayDate = isToday(date);
                    
                    return (
                      <div 
                        key={dateIndex} 
                        className={`
                          aspect-square flex items-center justify-center rounded-full text-sm
                          ${isCompleted ? 'bg-blue-500 text-white' : 'text-gray-700'}
                          ${isTodayDate && !isCompleted ? 'border border-blue-500' : ''}
                          ${date.getMonth() !== today.getMonth() ? 'opacity-50' : ''}
                        `}
                      >
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Streaks */}
            {streak.days > 0 && streak.startDate && (
              <div className="mt-6">
                <div className="text-sm font-medium text-gray-500 mb-2">Streaks</div>
                <div className="flex items-center">
                  <div className="text-xs text-gray-500 mr-2">
                    {format(streak.startDate, 'MMM d')}
                  </div>
                  <div className="flex-1 h-6 bg-blue-500 rounded"></div>
                  <div className="text-xs text-gray-500 ml-2">
                    {streak.days > 1 
                      ? format(addDays(streak.startDate, streak.days - 1), 'MMM d') 
                      : format(streak.startDate, 'MMM d')}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 