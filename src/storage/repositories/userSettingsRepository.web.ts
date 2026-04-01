import { DEFAULT_SETTINGS } from '@/src/constants/mood';
import type { UserSettings } from '@/src/types';

const STORAGE_KEY = 'moodot:web:user_settings';

const readSettings = (): UserSettings => {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    return {
      ...DEFAULT_SETTINGS,
      ...(JSON.parse(raw) as Partial<UserSettings>),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const writeSettings = (settings: UserSettings) => {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const userSettingsRepository = {
  async get(): Promise<UserSettings> {
    return readSettings();
  },

  async update(partial: Partial<UserSettings>): Promise<void> {
    const current = readSettings();
    const syncableKeys: Array<keyof UserSettings> = ['selectedPaletteId', 'notificationsEnabled', 'reminderTime'];
    const syncableChanged = syncableKeys.some((key) => partial[key] !== undefined && partial[key] !== current[key]);

    const next: UserSettings = {
      ...current,
      ...partial,
      settingsUpdatedAt:
        partial.settingsUpdatedAt ??
        (syncableChanged ? new Date().toISOString() : current.settingsUpdatedAt),
    };

    writeSettings(next);
  },
};
