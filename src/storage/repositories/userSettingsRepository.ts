import { db } from '@/src/storage/db';
import type { UserSettings } from '@/src/types';

type SettingsRow = {
  selected_palette_id: string;
  notifications_enabled: number;
  reminder_time: string;
  has_completed_onboarding: number;
  settings_updated_at: string;
  cloud_sync_enabled: number;
  cloud_last_synced_at: string | null;
};

const toSettings = (row: SettingsRow): UserSettings => ({
  selectedPaletteId: row.selected_palette_id,
  notificationsEnabled: row.notifications_enabled === 1,
  reminderTime: row.reminder_time,
  hasCompletedOnboarding: row.has_completed_onboarding === 1,
  settingsUpdatedAt: row.settings_updated_at,
  cloudSyncEnabled: row.cloud_sync_enabled === 1,
  cloudLastSyncedAt: row.cloud_last_synced_at ?? undefined,
});

export const userSettingsRepository = {
  async get(): Promise<UserSettings> {
    const row = await db.getFirstAsync<SettingsRow>(
      'SELECT selected_palette_id, notifications_enabled, reminder_time, has_completed_onboarding, settings_updated_at, cloud_sync_enabled, cloud_last_synced_at FROM user_settings WHERE id = ?',
      ['singleton'],
    );

    if (!row) {
      throw new Error('Settings row was not initialized.');
    }

    return toSettings(row);
  },

  async update(partial: Partial<UserSettings>): Promise<void> {
    const current = await this.get();
    const syncableKeys: Array<keyof UserSettings> = ['selectedPaletteId', 'notificationsEnabled', 'reminderTime'];
    const syncableChanged = syncableKeys.some((key) => partial[key] !== undefined && partial[key] !== current[key]);

    const next: UserSettings = {
      ...current,
      ...partial,
      settingsUpdatedAt:
        partial.settingsUpdatedAt ??
        (syncableChanged ? new Date().toISOString() : current.settingsUpdatedAt),
    };

    await db.runAsync(
      `
      UPDATE user_settings
      SET selected_palette_id = ?, notifications_enabled = ?, reminder_time = ?, is_premium = ?, has_completed_onboarding = ?, settings_updated_at = ?, cloud_sync_enabled = ?, cloud_last_synced_at = ?, ad_palette_unlock_date = ?, ad_premium_cards_unlock_date = ?
      WHERE id = ?
      `,
      [
        next.selectedPaletteId,
        next.notificationsEnabled ? 1 : 0,
        next.reminderTime,
        1,
        next.hasCompletedOnboarding ? 1 : 0,
        next.settingsUpdatedAt,
        next.cloudSyncEnabled ? 1 : 0,
        next.cloudLastSyncedAt ?? null,
        null,
        null,
        'singleton',
      ],
    );
  },
};
