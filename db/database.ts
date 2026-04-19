import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('habits.db');

export type Habit = {
  id: string;
  name: string;
  emoji: string;
  duration?: number;
  targetDays?: number[];
  category?: string;
  sortOrder: number;
  createdAt: string;
};

export type NewHabit = Omit<Habit, 'id' | 'sortOrder' | 'createdAt'>;

export type Entry = {
  id: string;
  habitId: string;
  date: string;
  completedAt: string;
};

export async function initDatabase(): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '✅',
      duration INTEGER,
      target_days TEXT,
      category TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      UNIQUE(habit_id, date)
    );
  `);
}

function rowToHabit(row: Record<string, unknown>): Habit {
  return {
    id: row.id as string,
    name: row.name as string,
    emoji: row.emoji as string,
    duration: row.duration as number | undefined,
    targetDays: row.target_days ? JSON.parse(row.target_days as string) : undefined,
    category: row.category as string | undefined,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
  };
}

function rowToEntry(row: Record<string, unknown>): Entry {
  return {
    id: row.id as string,
    habitId: row.habit_id as string,
    date: row.date as string,
    completedAt: row.completed_at as string,
  };
}

export async function getHabits(): Promise<Habit[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM habits ORDER BY sort_order ASC, created_at ASC'
  );
  return rows.map(rowToHabit);
}

export async function addHabit(h: NewHabit): Promise<Habit> {
  const id = `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();
  const targetDaysJson = h.targetDays ? JSON.stringify(h.targetDays) : null;

  const maxOrderRow = await db.getFirstAsync<{ max_order: number }>(
    'SELECT MAX(sort_order) as max_order FROM habits'
  );
  const sortOrder = (maxOrderRow?.max_order ?? -1) + 1;

  await db.runAsync(
    'INSERT INTO habits (id, name, emoji, duration, target_days, category, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, h.name, h.emoji, h.duration ?? null, targetDaysJson, h.category ?? null, sortOrder, now]
  );

  return { id, name: h.name, emoji: h.emoji, duration: h.duration, targetDays: h.targetDays, category: h.category, sortOrder, createdAt: now };
}

export async function updateHabit(id: string, h: Partial<NewHabit>): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (h.name !== undefined) { fields.push('name = ?'); values.push(h.name); }
  if (h.emoji !== undefined) { fields.push('emoji = ?'); values.push(h.emoji); }
  if (h.duration !== undefined) { fields.push('duration = ?'); values.push(h.duration); }
  if ('targetDays' in h) { fields.push('target_days = ?'); values.push(h.targetDays ? JSON.stringify(h.targetDays) : null); }
  if ('category' in h) { fields.push('category = ?'); values.push(h.category ?? null); }

  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE habits SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteHabit(id: string): Promise<void> {
  await db.runAsync('DELETE FROM habits WHERE id = ?', [id]);
}

export async function toggleEntry(habitId: string, date: string): Promise<boolean> {
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM entries WHERE habit_id = ? AND date = ?',
    [habitId, date]
  );

  if (existing) {
    await db.runAsync('DELETE FROM entries WHERE habit_id = ? AND date = ?', [habitId, date]);
    return false;
  } else {
    const id = `e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO entries (id, habit_id, date, completed_at) VALUES (?, ?, ?, ?)',
      [id, habitId, date, now]
    );
    return true;
  }
}

export async function getEntriesForHabit(habitId: string, fromDate: string, toDate: string): Promise<Entry[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM entries WHERE habit_id = ? AND date >= ? AND date <= ? ORDER BY date ASC',
    [habitId, fromDate, toDate]
  );
  return rows.map(rowToEntry);
}

export async function getEntriesForDate(date: string): Promise<Entry[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM entries WHERE date = ?',
    [date]
  );
  return rows.map(rowToEntry);
}

export async function getStreakForHabit(habitId: string): Promise<number> {
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM entries WHERE habit_id = ? ORDER BY date DESC',
    [habitId]
  );

  if (rows.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let cursor = new Date(today);

  for (const row of rows) {
    const entryDate = new Date(row.date);
    entryDate.setHours(0, 0, 0, 0);
    const diff = Math.round((cursor.getTime() - entryDate.getTime()) / 86400000);

    if (diff === 0 || diff === 1) {
      streak++;
      cursor = entryDate;
    } else {
      break;
    }
  }

  return streak;
}

export async function getCompletionRate(habitId: string, days: number): Promise<number> {
  const toDate = new Date().toISOString().split('T')[0];
  const from = new Date();
  from.setDate(from.getDate() - days + 1);
  const fromDate = from.toISOString().split('T')[0];

  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM entries WHERE habit_id = ? AND date >= ? AND date <= ?',
    [habitId, fromDate, toDate]
  );

  return Math.round(((result?.count ?? 0) / days) * 100);
}
