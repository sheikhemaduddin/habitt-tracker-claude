import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { Colors } from '@/constants/theme';
import { useHabits } from '@/context/HabitContext';
import { getCompletionRate, getStreakForHabit, type Habit } from '@/db/database';

type HabitStat = {
  habit: Habit;
  streak: number;
  rate30: number;
};

export default function StatsScreen() {
  const { habits, todayEntries, isLoading, todayString } = useHabits();
  const [habitStats, setHabitStats] = useState<HabitStat[]>([]);

  const todayDow = new Date(todayString + 'T00:00:00').getDay();
  const todayHabits = habits.filter(h => !h.targetDays || h.targetDays.length === 0 || h.targetDays.includes(todayDow));
  const completedToday = todayEntries.filter(e => todayHabits.some(h => h.id === e.habitId)).length;

  useEffect(() => {
    if (habits.length === 0) return;
    Promise.all(
      habits.map(async h => ({
        habit: h,
        streak: await getStreakForHabit(h.id),
        rate30: await getCompletionRate(h.id, 30),
      }))
    ).then(setHabitStats);
  }, [habits]);

  const bestStreak = habitStats.reduce((max, s) => Math.max(max, s.streak), 0);

  if (isLoading) return <SafeAreaView style={styles.safeArea} />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Stats</Text>
      </View>

      {habits.length === 0 ? (
        <EmptyState
          emoji="📈"
          title="No stats yet"
          subtitle="Add habits and start checking them off to see your progress here."
        />
      ) : (
        <FlatList<HabitStat>
          data={habitStats}
          keyExtractor={s => s.habit.id}
          ListHeaderComponent={
            <View style={styles.topCards}>
              <StatCard label="Total Habits" value={habits.length} />
              <StatCard
                label="Today"
                value={`${completedToday}/${todayHabits.length}`}
                subtitle="completed"
              />
              <StatCard label="Best Streak" value={`${bestStreak}d`} />
            </View>
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <HabitStatRow stat={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

function HabitStatRow({ stat }: { stat: HabitStat }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowEmoji}>{stat.habit.emoji}</Text>
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={styles.rowName}>{stat.habit.name}</Text>
          <Text style={styles.rowRate}>{stat.rate30}%</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${stat.rate30}%` }]} />
        </View>
        <Text style={styles.rowStreak}>
          {stat.streak > 0 ? `🔥 ${stat.streak} day streak` : 'No active streak'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
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
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  topCards: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  rowEmoji: {
    fontSize: 22,
    marginTop: 2,
  },
  rowContent: {
    flex: 1,
    gap: 6,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  rowRate: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  barTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.text,
    borderRadius: 2,
  },
  rowStreak: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
