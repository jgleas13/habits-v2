"use client";

import { useState } from 'react';
import { HabitItem } from './HabitItem';
import { HabitWithCompletion } from '@/lib/types';
import { groupHabitsByStatus } from '@/lib/habit-utils';

interface HabitListProps {
  habits: HabitWithCompletion[];
  onStatusChange: (habitId: number, status: 'success' | 'failed' | 'skipped') => void;
  onSelectHabit: (habit: HabitWithCompletion | null) => void;
}

export function HabitList({ habits, onStatusChange, onSelectHabit }: HabitListProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    pending: true,
    completed: true,
  });

  // Group habits by status
  const { pending, completed } = groupHabitsByStatus(habits);

  const toggleSection = (section: 'pending' | 'completed') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleHabitSelect = (habit: HabitWithCompletion) => {
    onSelectHabit(habit);
  };

  const renderSection = (title: string, habitsList: HabitWithCompletion[], section: 'pending' | 'completed') => {
    if (habitsList.length === 0) return null;

    return (
      <div className="mb-6">
        <button
          onClick={() => toggleSection(section)}
          className="flex items-center gap-2 mb-2 text-gray-700 hover:text-gray-900"
        >
          <svg
            className={`w-4 h-4 transition-transform ${
              expandedSections[section] ? 'transform rotate-90' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="font-medium">
            {title} ({habitsList.length})
          </span>
        </button>

        {expandedSections[section] && (
          <div className="space-y-2">
            {habitsList.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onStatusChange={onStatusChange}
                onSelect={handleHabitSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Pending Habits */}
      {renderSection('Pending', pending, 'pending')}

      {/* Completed Habits */}
      {renderSection('Completed', completed, 'completed')}

      {/* Empty State */}
      {habits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No habits yet. Add one to get started!</p>
        </div>
      )}
    </div>
  );
} 