import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { getEntriesForHabit, type Habit } from '@/db/database';

interface HeatmapGridProps {
  habit: Habit;
  weeks?: number;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CELL_SIZE = 13;
const CELL_GAP = 3;

function toYMD(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getMonthLabel(weekDates: Date[]): string | null {
  const firstOfMonth = weekDates.find(d => d.getDate() === 1);
  if (firstOfMonth) {
    return firstOfMonth.toLocaleString('en-US', { month: 'short' });
  }
  return null;
}

export function HeatmapGrid({ habit, weeks = 13 }: HeatmapGridProps) {
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const today = new Date();
    const toDate = toYMD(today);
    const from = new Date(today);
    from.setDate(from.getDate() - weeks * 7);
    const fromDate = toYMD(from);

    getEntriesForHabit(habit.id, fromDate, toDate).then(entries => {
      setCompletedDates(new Set(entries.map(e => e.date)));
    });
  }, [habit.id, weeks]);

  // Build grid: array of weeks, each week is array of 7 dates (Sun→Sat)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the Sunday of the current week
  const currentSunday = new Date(today);
  currentSunday.setDate(today.getDate() - today.getDay());

  const grid: Date[][] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(currentSunday);
      date.setDate(currentSunday.getDate() - w * 7 + d);
      week.push(date);
    }
    grid.push(week);
  }

  const todayStr = toYMD(today);

  function getCellColor(date: Date): string {
    const dateStr = toYMD(date);
    if (date > today) return 'transparent';

    if (completedDates.has(dateStr)) return Colors.heatmap4;

    // If habit has target days, show missed as lighter gray
    const dayOfWeek = date.getDay();
    if (habit.targetDays && !habit.targetDays.includes(dayOfWeek)) {
      return 'transparent';
    }

    return Colors.heatmap0;
  }

  return (
    <View style={styles.container}>
      {/* Day labels on left */}
      <View style={styles.dayLabels}>
        {DAY_LABELS.map((label, i) => (
          <Text key={i} style={styles.dayLabel}>{i % 2 === 1 ? label : ''}</Text>
        ))}
      </View>

      {/* Grid columns */}
      <View style={styles.grid}>
        {/* Month labels row */}
        <View style={styles.monthRow}>
          {grid.map((week, wi) => {
            const label = getMonthLabel(week);
            return (
              <View key={wi} style={styles.monthCell}>
                {label ? <Text style={styles.monthLabel}>{label}</Text> : null}
              </View>
            );
          })}
        </View>

        {/* Cells */}
        <View style={styles.columns}>
          {grid.map((week, wi) => (
            <View key={wi} style={styles.column}>
              {week.map((date, di) => {
                const dateStr = toYMD(date);
                const isToday = dateStr === todayStr;
                const color = getCellColor(date);
                return (
                  <View
                    key={di}
                    style={[
                      styles.cell,
                      { backgroundColor: color === 'transparent' ? 'transparent' : color },
                      color === 'transparent' && styles.cellEmpty,
                      isToday && styles.cellToday,
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
  dayLabels: {
    paddingTop: 18,
    gap: CELL_GAP,
  },
  dayLabel: {
    width: 10,
    height: CELL_SIZE,
    fontSize: 9,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: CELL_SIZE,
  },
  grid: {
    flex: 1,
  },
  monthRow: {
    flexDirection: 'row',
    height: 14,
    marginBottom: 2,
  },
  monthCell: {
    width: CELL_SIZE + CELL_GAP,
  },
  monthLabel: {
    fontSize: 9,
    color: Colors.textMuted,
  },
  columns: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  column: {
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 3,
  },
  cellEmpty: {
    backgroundColor: Colors.heatmap0,
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: Colors.textSecondary,
  },
});
