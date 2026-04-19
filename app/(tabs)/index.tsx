import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { HabitRow } from '@/components/HabitRow';
import { Colors } from '@/constants/theme';
import { useHabits } from '@/context/HabitContext';
import type { Habit } from '@/db/database';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function HomeScreen() {
  const { habits, todayEntries, isLoading, todayString, toggleHabit } = useHabits();
  const router = useRouter();

  const todayDow = new Date(todayString + 'T00:00:00').getDay();

  const todayHabits = habits.filter(h => {
    if (!h.targetDays || h.targetDays.length === 0) return true;
    return h.targetDays.includes(todayDow);
  });

  const completedIds = new Set(todayEntries.map(e => e.habitId));
  const doneCount = todayHabits.filter(h => completedIds.has(h.id)).length;

  if (isLoading) return <SafeAreaView style={styles.safeArea} />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Today</Text>
          <Text style={styles.date}>{formatDate(todayString)}</Text>
        </View>
        {todayHabits.length > 0 && (
          <View style={styles.progress}>
            <Text style={styles.progressText}>{doneCount}/{todayHabits.length}</Text>
          </View>
        )}
      </View>

      {todayHabits.length === 0 ? (
        <EmptyState
          emoji="🌱"
          title="No habits yet"
          subtitle="Tap + to add your first habit and start building streaks."
        />
      ) : (
        <FlatList<Habit>
          data={todayHabits}
          keyExtractor={h => h.id}
          renderItem={({ item }) => (
            <HabitRow
              habit={item}
              isCompleted={completedIds.has(item.id)}
              onToggle={() => toggleHabit(item.id)}
              onPress={() => router.push(`/habit/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/habit/new')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progress: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  list: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  fabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  fabIcon: {
    fontSize: 28,
    color: Colors.background,
    fontWeight: '300',
    lineHeight: 32,
  },
});
