import type { MoodEntry, MoodId } from '@/src/types';

const STORAGE_KEY = 'moodot:web:mood_entries';

const readEntries = (): MoodEntry[] => {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as MoodEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeEntries = (entries: MoodEntry[]) => {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const sanitizeNote = (note: string | undefined): string | undefined => {
  if (!note) {
    return undefined;
  }

  const normalized = note.trim().slice(0, 100);
  return normalized.length > 0 ? normalized : undefined;
};

export const moodEntryRepository = {
  async getAll(): Promise<MoodEntry[]> {
    return readEntries().sort((a, b) => a.date.localeCompare(b.date));
  },

  async getByDate(date: string): Promise<MoodEntry | null> {
    return readEntries().find((entry) => entry.date === date) ?? null;
  },

  async upsertByDate(params: {
    date: string;
    moodId: MoodId;
    paletteId: string;
    colorHex: string;
    note?: string;
  }): Promise<void> {
    const entries = readEntries();
    const existingIndex = entries.findIndex((entry) => entry.date === params.date);
    const nowIso = new Date().toISOString();

    if (existingIndex >= 0) {
      entries[existingIndex] = {
        ...entries[existingIndex],
        moodId: params.moodId,
        paletteId: params.paletteId,
        colorHex: params.colorHex,
        note: sanitizeNote(params.note),
        updatedAt: nowIso,
      };
      writeEntries(entries);
      return;
    }

    entries.push({
      id: `entry-${params.date}`,
      date: params.date,
      moodId: params.moodId,
      paletteId: params.paletteId,
      colorHex: params.colorHex,
      note: sanitizeNote(params.note),
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    writeEntries(entries);
  },

  async upsertMany(entries: MoodEntry[]): Promise<void> {
    const byDate = new Map<string, MoodEntry>();

    for (const entry of readEntries()) {
      byDate.set(entry.date, entry);
    }

    for (const entry of entries) {
      byDate.set(entry.date, {
        ...entry,
        note: sanitizeNote(entry.note),
      });
    }

    writeEntries(Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date)));
  },
};
