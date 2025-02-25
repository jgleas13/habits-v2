"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Habit, HabitFrequency, DayOfWeek } from '@/lib/types';

interface HabitFormProps {
  onClose: () => void;
  onSave: () => void;
  habit?: Habit; // If provided, we're editing an existing habit
}

export function HabitForm({ onClose, onSave, habit }: HabitFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState(habit?.name || '');
  const [frequency, setFrequency] = useState<HabitFrequency>(habit?.frequency || 'daily');
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>(
    habit?.repeat_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  );
  const [startDate, setStartDate] = useState(habit?.start_date || format(new Date(), 'yyyy-MM-dd'));
  const [timeOfDay, setTimeOfDay] = useState(habit?.time_of_day || '08:00:00');
  const [goal, setGoal] = useState(habit?.goal || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!habit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const habitData = {
        name,
        frequency,
        repeat_days: repeatDays,
        start_date: startDate,
        time_of_day: timeOfDay,
        goal,
        user_id: user.id,
      };
      
      if (isEditing) {
        // Update existing habit
        const { error } = await supabase
          .from('habits')
          .update(habitData)
          .eq('id', habit.id)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Create new habit
        const { error } = await supabase
          .from('habits')
          .insert([habitData]);
          
        if (error) throw error;
      }
      
      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving habit:', err);
      setError('Failed to save habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDayToggle = (day: DayOfWeek) => {
    if (repeatDays.includes(day)) {
      // Remove day if it's already selected
      setRepeatDays(repeatDays.filter(d => d !== day));
    } else {
      // Add day if it's not selected
      setRepeatDays([...repeatDays, day]);
    }
  };

  const daysOfWeek: DayOfWeek[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Habit' : 'Create Habit'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
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

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Goal */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">GOAL</label>
            <div className="flex gap-4">
              <input
                type="number"
                min="1"
                value={goal}
                onChange={(e) => setGoal(parseInt(e.target.value))}
                className="w-24 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value="Times"
              >
                <option>Times</option>
              </select>
              <select
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value="Per Day"
              >
                <option>Per Day</option>
              </select>
            </div>
          </div>

          {/* Repeat */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">REPEAT</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Days of Week (only show if frequency is daily or weekly) */}
          {(frequency === 'daily' || frequency === 'weekly') && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">DAYS</label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      repeatDays.includes(day)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time of Day */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">TIME OF DAY</label>
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="08:00:00">Morning</option>
              <option value="12:00:00">Afternoon</option>
              <option value="18:00:00">Evening</option>
              <option value="21:00:00">Night</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">START DATE</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            {isEditing && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            )}
            <div className="flex gap-4 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 