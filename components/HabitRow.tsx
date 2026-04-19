import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';
import type { Habit } from '@/db/database';

interface HabitRowProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  onPress: () => void;
}

export function HabitRow({ habit, isCompleted, onToggle, onPress }: HabitRowProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        style={({ pressed }) => [styles.checkbox, isCompleted && styles.checkboxDone, pressed && styles.pressed]}
      >
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </Pressable>

      <Pressable onPress={onPress} style={styles.content}>
        <Text style={styles.emoji}>{habit.emoji}</Text>
        <View style={styles.textBlock}>
          <Text style={[styles.name, isCompleted && styles.nameDone]}>{habit.name}</Text>
          <View style={styles.meta}>
            {habit.duration ? (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{habit.duration} min</Text>
              </View>
            ) : null}
            {habit.category ? (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{habit.category}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  checkmark: {
    color: Colors.background,
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 22,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  nameDone: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  meta: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    backgroundColor: Colors.surface,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chipText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  chevron: {
    fontSize: 20,
    color: Colors.textMuted,
    fontWeight: '300',
  },
});
