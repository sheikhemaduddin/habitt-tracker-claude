import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { HeatmapGrid } from '@/components/HeatmapGrid';
import { Colors } from '@/constants/theme';
import { useHabits } from '@/context/HabitContext';
import type { Habit } from '@/db/database';

export default function HeatmapScreen() {
  const { habits, isLoading } = useHabits();

  if (isLoading) return <SafeAreaView style={styles.safeArea} />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Consistency</Text>
        <Text style={styles.subtitle}>Last 3 months</Text>
      </View>

      {habits.length === 0 ? (
        <EmptyState
          emoji="📊"
          title="No habits tracked yet"
          subtitle="Add habits on the Today tab to see your consistency heatmap."
        />
      ) : (
        <FlatList<Habit>
          data={habits}
          keyExtractor={h => h.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.habitSection}>
              <View style={styles.habitHeader}>
                <Text style={styles.habitEmoji}>{item.emoji}</Text>
                <Text style={styles.habitName}>{item.name}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HeatmapGrid habit={item} weeks={13} />
              </ScrollView>
              <View style={styles.legend}>
                <Text style={styles.legendLabel}>Less</Text>
                {([Colors.heatmap0, Colors.heatmap1, Colors.heatmap2, Colors.heatmap3, Colors.heatmap4] as string[]).map((c, i) => (
                  <View key={i} style={[styles.legendCell, { backgroundColor: c }]} />
                ))}
                <Text style={styles.legendLabel}>More</Text>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
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
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  habitSection: {
    gap: 10,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  habitEmoji: {
    fontSize: 20,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  legendLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginHorizontal: 2,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
});
