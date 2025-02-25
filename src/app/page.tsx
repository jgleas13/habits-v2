'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { HabitList } from '@/components/habits/HabitList';
import { DateSelector } from '@/components/habits/DateSelector';
import { HabitForm } from '@/components/habits/HabitForm';
import { HabitDetailPanel } from '@/components/habits/HabitDetailPanel';
import { useDate } from '@/lib/date-context';
import { useHabits } from '@/lib/use-habits';
import { HabitWithCompletion } from '@/lib/types';

export default function Home() {
  const { selectedDate } = useDate();
  const { habits, isLoading, updateHabitStatus } = useHabits(selectedDate);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<HabitWithCompletion | null>(null);

  const handleAddHabit = () => {
    setShowHabitForm(true);
  };

  const handleHabitFormClose = () => {
    setShowHabitForm(false);
  };

  const handleHabitFormSave = () => {
    // The form will handle the actual saving, we just need to refresh the habits
    // This will be triggered after a successful save
  };

  const handleSelectHabit = (habit: HabitWithCompletion | null) => {
    setSelectedHabit(habit);
  };

  const handleCloseDetailPanel = () => {
    setSelectedHabit(null);
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
      {/* Left Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className={`flex-1 ${selectedHabit ? 'mr-96' : ''} transition-all duration-300`}>
        <main className="h-full p-8 overflow-auto">
          <div className="max-w-full">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">Habits</h1>
              
              <button
                onClick={handleAddHabit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Habit
              </button>
            </div>

            <DateSelector />

            <HabitList 
              habits={habits} 
              onStatusChange={updateHabitStatus}
              onSelectHabit={handleSelectHabit}
            />
          </div>
        </main>
      </div>

      {/* Fixed Detail Panel */}
      {selectedHabit && (
        <HabitDetailPanel 
          habit={selectedHabit} 
          onClose={handleCloseDetailPanel} 
        />
      )}

      {showHabitForm && (
        <HabitForm 
          onClose={handleHabitFormClose} 
          onSave={handleHabitFormSave} 
        />
      )}
    </div>
  );
}
