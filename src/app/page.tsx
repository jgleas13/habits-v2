'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { HabitList } from '@/components/habits/HabitList';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import type { Habit } from '@/components/habits/HabitItem';

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newHabit, setNewHabit] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    // Log authentication state
    console.log('Authentication state:', user ? 'Authenticated as ' + user.id : 'Not authenticated');
    
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
      console.log('Adding habit:', newHabit.trim(), 'for user:', user.id);
      
      // Create the habit object with the exact schema expected by Supabase
      const habitData = {
        name: newHabit.trim(),
        done: false,
        user_id: user.id
      };
      
      console.log('Sending habit data:', habitData);
      
      const { data, error } = await supabase
        .from('habits')
        .insert([habitData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding habit:', error);
        throw error;
      }
      
      console.log('Successfully added habit:', data);
      setHabits([data, ...habits]);
      setNewHabit('');
    } catch (error) {
      console.error('Error adding habit:', error);
      alert('Failed to add habit. Please check the console for details.');
    }
  };

  const updateHabitStatus = async (habit: Habit, done: boolean) => {
    try {
      const { error } = await supabase
        .from('habits')
        .update({
          done: done
        })
        .eq('id', habit.id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setHabits(habits.map(h =>
        h.id === habit.id ? { ...h, done: done } : h
      ));
    } catch (error) {
      console.error('Error updating habit status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">All Habits</h1>
              <p className="text-gray-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>

            <div className="flex items-center gap-4">
              <form onSubmit={addHabit} className="flex gap-4">
                <input
                  type="text"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  placeholder="Add a new habit..."
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[300px]"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add Habit
                </button>
              </form>
            </div>
          </div>

          <HabitList habits={habits} onStatusChange={updateHabitStatus} />
        </div>
      </main>
    </div>
  );
}
