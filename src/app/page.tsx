'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Habit {
  id: number;
  name: string;
  done: boolean;
  created_at?: string;
}

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching habits:', error);
        throw error;
      }
      
      console.log('Fetched habits:', data);
      setHabits(data || []);
    } catch (err) {
      console.error('Error in fetchHabits:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching habits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert([{ name: newHabit.trim(), done: false }])
        .select()
        .single();

      if (error) {
        console.error('Error adding habit:', error);
        throw error;
      }

      console.log('Added habit:', data);
      setHabits([data, ...habits]);
      setNewHabit('');
    } catch (err) {
      console.error('Error in handleAddHabit:', err);
      setError(err instanceof Error ? err.message : 'Failed to add habit');
    }
  };

  const toggleHabit = async (habit: Habit) => {
    try {
      const { error } = await supabase
        .from('habits')
        .update({ done: !habit.done })
        .eq('id', habit.id)
        .select();

      if (error) {
        console.error('Error toggling habit:', error);
        throw error;
      }

      setHabits(habits.map(h => 
        h.id === habit.id ? { ...h, done: !h.done } : h
      ));
    } catch (err) {
      console.error('Error in toggleHabit:', err);
      setError(err instanceof Error ? err.message : 'Failed to update habit');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Habit Tracker</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleAddHabit} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Enter a new habit"
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Habit
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg shadow"
          >
            <input
              type="checkbox"
              checked={habit.done}
              onChange={() => toggleHabit(habit)}
              className="h-6 w-6 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className={`flex-1 ${habit.done ? 'line-through text-gray-500' : ''}`}>
              {habit.name}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(habit.created_at!).toLocaleDateString()}
            </span>
          </div>
        ))}
        
        {habits.length === 0 && (
          <p className="text-center text-gray-500">No habits yet. Add one to get started!</p>
        )}
      </div>
    </main>
  );
}
