import { useState } from 'react';
import { HabitItem, type Habit } from './HabitItem';

interface HabitListProps {
  habits: Habit[];
  onStatusChange: (habit: Habit, done: boolean) => void;
}

export function HabitList({ habits, onStatusChange }: HabitListProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    pending: true,
    completed: true,
  });

  // Group habits by done status
  const pendingHabits = habits.filter(habit => !habit.done);
  const completedHabits = habits.filter(habit => habit.done);

  const toggleSection = (section: 'pending' | 'completed') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderSection = (title: string, habitsList: Habit[], section: 'pending' | 'completed') => {
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
      {renderSection('Pending', pendingHabits, 'pending')}

      {/* Completed Habits */}
      {renderSection('Completed', completedHabits, 'completed')}

      {/* Empty State */}
      {habits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No habits yet. Add one to get started!</p>
        </div>
      )}
    </div>
  );
} 