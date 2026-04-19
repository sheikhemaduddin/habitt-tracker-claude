import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  Entry,
  Habit,
  NewHabit,
  addHabit as dbAddHabit,
  deleteHabit as dbDeleteHabit,
  getEntriesForDate,
  getHabits,
  initDatabase,
  toggleEntry,
  updateHabit as dbUpdateHabit,
} from '@/db/database';

type HabitContextValue = {
  habits: Habit[];
  todayEntries: Entry[];
  isLoading: boolean;
  todayString: string;
  toggleHabit: (habitId: string) => Promise<void>;
  addHabit: (h: NewHabit) => Promise<void>;
  updateHabit: (id: string, h: Partial<NewHabit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const HabitContext = createContext<HabitContextValue | null>(null);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayEntries, setTodayEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const todayString = new Date().toISOString().split('T')[0];

  const load = useCallback(async () => {
    const [h, e] = await Promise.all([getHabits(), getEntriesForDate(todayString)]);
    setHabits(h);
    setTodayEntries(e);
  }, [todayString]);

  useEffect(() => {
    initDatabase()
      .then(load)
      .finally(() => setIsLoading(false));
  }, [load]);

  const toggleHabit = useCallback(async (habitId: string) => {
    await toggleEntry(habitId, todayString);
    const entries = await getEntriesForDate(todayString);
    setTodayEntries(entries);
  }, [todayString]);

  const addHabit = useCallback(async (h: NewHabit) => {
    await dbAddHabit(h);
    await load();
  }, [load]);

  const updateHabit = useCallback(async (id: string, h: Partial<NewHabit>) => {
    await dbUpdateHabit(id, h);
    await load();
  }, [load]);

  const deleteHabit = useCallback(async (id: string) => {
    await dbDeleteHabit(id);
    await load();
  }, [load]);

  return (
    <HabitContext.Provider value={{ habits, todayEntries, isLoading, todayString, toggleHabit, addHabit, updateHabit, deleteHabit, refresh: load }}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits(): HabitContextValue {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error('useHabits must be used inside HabitProvider');
  return ctx;
}
