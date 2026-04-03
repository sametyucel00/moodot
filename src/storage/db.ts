import * as SQLite from 'expo-sqlite';

import { DEFAULT_SETTINGS } from '@/src/constants/mood';

export const db = SQLite.openDatabaseSync('moodot.db');

const ensureColumn = async (tableName: string, columnName: string, columnDefinition: string) => {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName});`);
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition};`);
  }
};

export const initDb = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS mood_entries (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL UNIQUE,
      mood_id TEXT NOT NULL,
      palette_id TEXT NOT NULL,
      color_hex TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY NOT NULL,
      selected_palette_id TEXT NOT NULL,
      notifications_enabled INTEGER NOT NULL,
      reminder_time TEXT NOT NULL,
      is_premium INTEGER NOT NULL,
      has_completed_onboarding INTEGER NOT NULL DEFAULT 0,
      settings_updated_at TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z',
      cloud_sync_enabled INTEGER NOT NULL DEFAULT 0,
      cloud_last_synced_at TEXT,
      ad_palette_unlock_date TEXT,
      ad_premium_cards_unlock_date TEXT
    );
  `);

  await ensureColumn('user_settings', 'has_completed_onboarding', 'INTEGER NOT NULL DEFAULT 0');
  await ensureColumn('user_settings', 'settings_updated_at', `TEXT NOT NULL DEFAULT '${DEFAULT_SETTINGS.settingsUpdatedAt}'`);
  await ensureColumn('user_settings', 'cloud_sync_enabled', 'INTEGER NOT NULL DEFAULT 0');
  await ensureColumn('user_settings', 'cloud_last_synced_at', 'TEXT');
  await ensureColumn('user_settings', 'ad_palette_unlock_date', 'TEXT');
  await ensureColumn('user_settings', 'ad_premium_cards_unlock_date', 'TEXT');

  const row = await db.getFirstAsync<{ id: string }>('SELECT id FROM user_settings WHERE id = ?', ['singleton']);

  if (!row) {
    await db.runAsync(
      `
      INSERT INTO user_settings (
        id,
        selected_palette_id,
        notifications_enabled,
        reminder_time,
        is_premium,
        has_completed_onboarding,
        settings_updated_at,
        cloud_sync_enabled,
        cloud_last_synced_at,
        ad_palette_unlock_date,
        ad_premium_cards_unlock_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        'singleton',
        DEFAULT_SETTINGS.selectedPaletteId,
        DEFAULT_SETTINGS.notificationsEnabled ? 1 : 0,
        DEFAULT_SETTINGS.reminderTime,
        1,
        DEFAULT_SETTINGS.hasCompletedOnboarding ? 1 : 0,
        DEFAULT_SETTINGS.settingsUpdatedAt,
        DEFAULT_SETTINGS.cloudSyncEnabled ? 1 : 0,
        DEFAULT_SETTINGS.cloudLastSyncedAt ?? null,
        null,
        null,
      ],
    );
  }
};
