import { db } from '@/src/storage/db';
import type { MoodEntry, MoodId } from '@/src/types';

type MoodEntryRow = {
  id: string;
  date: string;
  mood_id: MoodId;
  palette_id: string;
  color_hex: string;
  note: string | null;
  created_at: string;
  updated_at: string;
};

const toMoodEntry = (row: MoodEntryRow): MoodEntry => ({
  id: row.id,
  date: row.date,
  moodId: row.mood_id,
  paletteId: row.palette_id,
  colorHex: row.color_hex,
  note: row.note ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const sanitizeNote = (note: string | undefined): string | null => {
  if (!note) {
    return null;
  }
  const normalized = note.trim().slice(0, 100);
  return normalized.length > 0 ? normalized : null;
};

export const moodEntryRepository = {
  async getAll(): Promise<MoodEntry[]> {
    const rows = await db.getAllAsync<MoodEntryRow>('SELECT * FROM mood_entries ORDER BY date ASC');
    return rows.map(toMoodEntry);
  },

  async getByDate(date: string): Promise<MoodEntry | null> {
    const row = await db.getFirstAsync<MoodEntryRow>('SELECT * FROM mood_entries WHERE date = ?', [date]);
    return row ? toMoodEntry(row) : null;
  },

  async upsertByDate(params: {
    date: string;
    moodId: MoodId;
    paletteId: string;
    colorHex: string;
    note?: string;
  }): Promise<void> {
    const existing = await this.getByDate(params.date);
    const nowIso = new Date().toISOString();

    if (existing) {
      await db.runAsync(
        `
        UPDATE mood_entries
        SET mood_id = ?, palette_id = ?, color_hex = ?, note = ?, updated_at = ?
        WHERE date = ?
        `,
        [params.moodId, params.paletteId, params.colorHex, sanitizeNote(params.note), nowIso, params.date],
      );
      return;
    }

    await db.runAsync(
      `
      INSERT INTO mood_entries (id, date, mood_id, palette_id, color_hex, note, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        `entry-${params.date}`,
        params.date,
        params.moodId,
        params.paletteId,
        params.colorHex,
        sanitizeNote(params.note),
        nowIso,
        nowIso,
      ],
    );
  },

  async upsertMany(entries: MoodEntry[]): Promise<void> {
    for (const entry of entries) {
      await db.runAsync(
        `
        INSERT INTO mood_entries (id, date, mood_id, palette_id, color_hex, note, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
          mood_id = excluded.mood_id,
          palette_id = excluded.palette_id,
          color_hex = excluded.color_hex,
          note = excluded.note,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at
        `,
        [
          entry.id || `entry-${entry.date}`,
          entry.date,
          entry.moodId,
          entry.paletteId,
          entry.colorHex,
          sanitizeNote(entry.note),
          entry.createdAt,
          entry.updatedAt,
        ],
      );
    }
  },
};
