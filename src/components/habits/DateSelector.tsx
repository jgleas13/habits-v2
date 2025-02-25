"use client";

import { format, addDays, subDays, isToday } from 'date-fns';
import { useDate } from '@/lib/date-context';

export function DateSelector() {
  const { selectedDate, setSelectedDate } = useDate();

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const goToPreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <button
          onClick={goToPreviousDay}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Previous day"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        
        <div className="text-lg font-medium">
          {isToday(selectedDate) ? (
            <span className="text-blue-600">Today</span>
          ) : (
            format(selectedDate, 'EEEE, MMMM d, yyyy')
          )}
        </div>
        
        <button
          onClick={goToNextDay}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Next day"
        >
          <svg
            className="w-5 h-5 text-gray-600"
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
        </button>
      </div>
      
      {!isToday(selectedDate) && (
        <button
          onClick={goToToday}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Go to Today
        </button>
      )}
    </div>
  );
} 