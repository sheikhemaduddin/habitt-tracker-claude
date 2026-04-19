import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { HabitForm } from '@/components/HabitForm';
import { useHabits } from '@/context/HabitContext';
import type { NewHabit } from '@/db/database';

export default function NewHabitScreen() {
  const { addHabit } = useHabits();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave(data: NewHabit) {
    setIsLoading(true);
    try {
      await addHabit(data);
      router.back();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'New Habit' }} />
      <HabitForm onSave={handleSave} isLoading={isLoading} />
    </>
  );
}
