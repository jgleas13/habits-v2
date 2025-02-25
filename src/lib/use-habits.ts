"use client";

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth-context';
import { Habit, HabitWithCompletion } from './types';
import { formatDateForDB, getHabitsForDate } from './habit-utils';

export function useHabits(date: Date) {
  const [habits, setHabits] = useState<HabitWithCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const fetchHabits = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Format date for database query
        const formattedDate = formatDateForDB(date);
        
        // Fetch all habits for the user
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .eq('archived', false)
          .order('created_at', { ascending: false });
          
        if (habitsError) throw habitsError;
        
        // Filter habits that should be active on the selected date
        const activeHabits = getHabitsForDate(habitsData || [], date);
        
        // Fetch completions for the active habits on the selected date
        const habitIds = activeHabits.map(h => h.id);
        
        if (habitIds.length > 0) {
          const { data: completionsData, error: completionsError } = await supabase
            .from('habit_completions')
            .select('*')
            .eq('user_id', user.id)
            .eq('completion_date', formattedDate)
            .in('habit_id', habitIds);
            
          if (completionsError) throw completionsError;
          
          // Combine habits with their completions
          const habitsWithCompletions: HabitWithCompletion[] = activeHabits.map(habit => {
            const completion = completionsData?.find(c => c.habit_id === habit.id);
            return {
              ...habit,
              completion: completion || undefined,
              status: completion?.status || 'unknown'
            };
          });
          
          setHabits(habitsWithCompletions);
        } else {
          setHabits([]);
        }
      } catch (err) {
        console.error('Error fetching habits:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHabits();
  }, [user, date]);
  
  const updateHabitStatus = async (habitId: number, status: 'success' | 'failed' | 'skipped') => {
    if (!user) return;
    
    try {
      const formattedDate = formatDateForDB(date);
      
      // Check if a completion record already exists
      const { data: existingCompletion } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .eq('completion_date', formattedDate)
        .single();
      
      if (existingCompletion) {
        // Update existing completion
        const { error } = await supabase
          .from('habit_completions')
          .update({
            status,
            completed_at: status === 'success' ? new Date().toISOString() : null
          })
          .eq('id', existingCompletion.id);
          
        if (error) throw error;
      } else {
        // Create new completion
        const { error } = await supabase
          .from('habit_completions')
          .insert([{
            habit_id: habitId,
            user_id: user.id,
            completion_date: formattedDate,
            status,
            completed_at: status === 'success' ? new Date().toISOString() : null
          }]);
          
        if (error) throw error;
      }
      
      // Update local state
      setHabits(prevHabits => 
        prevHabits.map(habit => 
          habit.id === habitId 
            ? {
                ...habit,
                status,
                completion: {
                  ...habit.completion,
                  habit_id: habitId,
                  user_id: user.id,
                  completion_date: formattedDate,
                  status,
                  completed_at: status === 'success' ? new Date().toISOString() : null,
                  notes: null,
                  id: habit.completion?.id || 0
                }
              } 
            : habit
        )
      );
    } catch (err) {
      console.error('Error updating habit status:', err);
      throw err;
    }
  };
  
  return { habits, isLoading, error, updateHabitStatus };
} 