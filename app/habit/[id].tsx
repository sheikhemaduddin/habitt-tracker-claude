import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { HabitForm } from '@/components/HabitForm';
import { useHabits } from '@/context/HabitContext';
import type { NewHabit } from '@/db/database';

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, updateHabit, deleteHabit } = useHabits();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const habit = habits.find(h => h.id === id);

  if (!habit) return null;

  async function handleSave(data: NewHabit) {
    setIsLoading(true);
    try {
      await updateHabit(id, data);
      router.back();
    } finally {
      setIsLoading(false);
    }
  }

  function handleDelete() {
    Alert.alert(
      'Delete Habit',
      `Delete "${habit!.name}"? All history will be lost.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(id);
            router.back();
          },
        },
      ]
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: habit.name }} />
      <HabitForm initial={habit} onSave={handleSave} onDelete={handleDelete} isLoading={isLoading} />
    </>
  );
}
