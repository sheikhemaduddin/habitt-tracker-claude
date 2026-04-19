import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Colors } from '@/constants/theme';
import type { Habit, NewHabit } from '@/db/database';

const COMMON_EMOJIS = [
  '🏃','🧘','💪','📚','💧','✏️','🎯','🎸','🍎','😴',
  '🚴','🏊','🧠','🌱','🍵','💊','🧹','🛁','🌅','🎨',
  '🏋️','🤸','🚶','🧗','🏄','⚽','🎾','🏸','🎻','🖊️',
];

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface HabitFormProps {
  initial?: Habit;
  onSave: (data: NewHabit) => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export function HabitForm({ initial, onSave, onDelete, isLoading }: HabitFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '✅');
  const [duration, setDuration] = useState(initial?.duration?.toString() ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [targetDays, setTargetDays] = useState<number[]>(initial?.targetDays ?? []);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const allDays = targetDays.length === 0;

  function toggleDay(day: number) {
    setTargetDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      emoji,
      duration: duration ? parseInt(duration, 10) : undefined,
      category: category.trim() || undefined,
      targetDays: targetDays.length > 0 ? targetDays : undefined,
    });
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Emoji picker */}
        <Text style={styles.label}>Emoji</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
          {COMMON_EMOJIS.map(e => (
            <Pressable
              key={e}
              onPress={() => setEmoji(e)}
              style={[styles.emojiBtn, emoji === e && styles.emojiBtnSelected]}
            >
              <Text style={styles.emojiChar}>{e}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Morning Run"
          placeholderTextColor={Colors.textMuted}
          autoFocus={!initial}
          returnKeyType="done"
        />

        {/* Advanced toggle */}
        <Pressable onPress={() => setShowAdvanced(v => !v)} style={styles.advancedToggle}>
          <Text style={styles.advancedToggleText}>
            {showAdvanced ? '▾' : '▸'} More options
          </Text>
        </Pressable>

        {showAdvanced && (
          <View style={styles.advanced}>
            {/* Duration */}
            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g. 30"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              returnKeyType="done"
            />

            {/* Category */}
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="e.g. Health"
              placeholderTextColor={Colors.textMuted}
              returnKeyType="done"
            />

            {/* Target days */}
            <Text style={styles.label}>Target days</Text>
            <Text style={styles.subLabel}>Leave all unselected for every day</Text>
            <View style={styles.daysRow}>
              {DAY_NAMES.map((d, i) => (
                <Pressable
                  key={i}
                  onPress={() => toggleDay(i)}
                  style={[styles.dayBtn, targetDays.includes(i) && styles.dayBtnSelected]}
                >
                  <Text style={[styles.dayBtnText, targetDays.includes(i) && styles.dayBtnTextSelected]}>
                    {d}
                  </Text>
                </Pressable>
              ))}
            </View>
            {allDays && <Text style={styles.allDaysNote}>Every day</Text>}
          </View>
        )}

        {/* Save button */}
        <Pressable
          onPress={handleSave}
          disabled={!name.trim() || isLoading}
          style={({ pressed }) => [
            styles.saveBtn,
            (!name.trim() || isLoading) && styles.saveBtnDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.saveBtnText}>{initial ? 'Save Changes' : 'Add Habit'}</Text>
        </Pressable>

        {/* Delete */}
        {onDelete && (
          <Pressable onPress={onDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>Delete Habit</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    padding: 20,
    gap: 8,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: -4,
    marginBottom: 8,
  },
  emojiScroll: {
    flexGrow: 0,
  },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: Colors.surface,
  },
  emojiBtnSelected: {
    backgroundColor: Colors.text,
  },
  emojiChar: {
    fontSize: 22,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  advancedToggle: {
    marginTop: 12,
    paddingVertical: 4,
  },
  advancedToggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  advanced: {
    gap: 0,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtnSelected: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  dayBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  dayBtnTextSelected: {
    color: Colors.background,
  },
  allDaysNote: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 6,
  },
  saveBtn: {
    marginTop: 32,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: Colors.border,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
  pressed: {
    opacity: 0.75,
  },
  deleteBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteBtnText: {
    fontSize: 15,
    color: '#CC0000',
  },
});
