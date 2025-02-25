"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { format } from 'date-fns';

interface Habit {
  id: number;
  name: string;
  done: boolean;
  created_at: string;
  user_id: string;
}

export function HabitManager() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchHabits();
    }
  }, [user]);

  const fetchHabits = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert([{
          name: newHabit.trim(),
          done: false,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      setHabits([data, ...habits]);
      setNewHabit('');
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const toggleHabit = async (habit: Habit) => {
    try {
      const { error } = await supabase
        .from('habits')
        .update({ done: !habit.done })
        .eq('id', habit.id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setHabits(habits.map(h =>
        h.id === habit.id ? { ...h, done: !h.done } : h
      ));
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Today's Habits</h1>
        <p className="text-gray-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <form onSubmit={addHabit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Add a new habit..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Habit
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-gray-200 transition-all"
          >
            <button
              onClick={() => toggleHabit(habit)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                habit.done
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 hover:border-green-500'
              }`}
            >
              {habit.done && (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
            <span className={`flex-1 text-lg ${habit.done ? 'text-gray-500 line-through' : ''}`}>
              {habit.name}
            </span>
          </div>
        ))}

        {habits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No habits yet. Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
} 