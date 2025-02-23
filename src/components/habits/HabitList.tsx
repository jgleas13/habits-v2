import { useState } from 'react';
import { HabitItem, type Habit } from './HabitItem';

interface HabitListProps {
  habits: Habit[];
  onStatusChange: (habit: Habit, newStatus: Habit['status']) => void;
}

interface HabitGroups {
  unknown: Habit[];
  success: Habit[];
  failed: Habit[];
  skipped: Habit[];
}

export function HabitList({ habits, onStatusChange }: HabitListProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    unknown: true,
    success: true,
    failed: true,
    skipped: true,
  });

  const groupedHabits = habits.reduce<HabitGroups>(
    (groups, habit) => {
      groups[habit.status].push(habit);
      return groups;
    },
    {
      unknown: [],
      success: [],
      failed: [],
      skipped: [],
    }
  );

  const toggleSection = (section: keyof HabitGroups) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderSection = (title: string, habits: Habit[], status: keyof HabitGroups) => {
    if (habits.length === 0) return null;

    return (
      <div className="mb-6">
        <button
          onClick={() => toggleSection(status)}
          className="flex items-center gap-2 mb-2 text-gray-700 hover:text-gray-900"
        >
          <svg
            className={`w-4 h-4 transition-transform ${
              expandedSections[status] ? 'transform rotate-90' : ''
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
            {title} ({habits.length})
          </span>
        </button>

        {expandedSections[status] && (
          <div className="space-y-2">
            {habits.map((habit) => (
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
      {groupedHabits.unknown.length > 0 && (
        <div className="mb-8">
          <div className="space-y-2">
            {groupedHabits.unknown.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Sections */}
      {renderSection('Success', groupedHabits.success, 'success')}
      {renderSection('Failed', groupedHabits.failed, 'failed')}
      {renderSection('Skipped', groupedHabits.skipped, 'skipped')}

      {/* Empty State */}
      {habits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No habits yet. Add one to get started!</p>
        </div>
      )}
    </div>
  );
} 