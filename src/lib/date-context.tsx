"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { startOfDay } from 'date-fns';

interface DateContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: React.ReactNode }) {
  // Default to today's date
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateContext.Provider>
  );
}

export function useDate() {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
} 