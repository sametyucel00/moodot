import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';

import { DEFAULT_SETTINGS } from '@/src/constants/mood';
import { authService, AuthProviderLabel } from '@/src/features/auth/authService';
import { getTodayKey } from '@/src/features/mood/dateUtils';
import { moodService } from '@/src/features/mood/moodService';
import { notificationService } from '@/src/features/notifications/notificationService';
import { paletteService } from '@/src/features/palette/paletteService';
import { FirestoreRemoteSyncRepository, createSyncService } from '@/src/features/sync/syncService';
import { initDb } from '@/src/storage/db';
import { moodEntryRepository } from '@/src/storage/repositories/moodEntryRepository';
import { userSettingsRepository } from '@/src/storage/repositories/userSettingsRepository';
import type { MoodEntry, MoodId, UserSettings } from '@/src/types';

type SyncState = {
  lastSyncedAt?: string;
  syncedCount?: number;
  inProgress: boolean;
  error?: string;
};

type AuthState = {
  loading: boolean;
  isSignedIn: boolean;
  userId?: string;
  provider: AuthProviderLabel;
};

type AppContextValue = {
  loading: boolean;
  entries: MoodEntry[];
  settings: UserSettings;
  syncState: SyncState;
  authState: AuthState;
  needsOnboarding: boolean;
  refreshAll: () => Promise<void>;
  saveTodayMood: (params: { moodId: MoodId; note?: string }) => Promise<void>;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
  completeOnboarding: (partial: Partial<UserSettings>) => Promise<void>;
  runSync: () => Promise<void>;
  connectCloudAccount: () => Promise<void>;
  disconnectCloudAccount: () => Promise<void>;
  deletePremiumCloudAccount: () => Promise<void>;
  getEntryByDate: (date: string) => MoodEntry | undefined;
};

const AppContext = createContext<AppContextValue | null>(null);

const syncService = createSyncService({
  localMoodRepository: moodEntryRepository,
  localSettingsRepository: userSettingsRepository,
  remoteRepository: new FirestoreRemoteSyncRepository(),
});

const shouldSyncInBackground = (settings: UserSettings, user: User | null): boolean =>
  settings.cloudSyncEnabled && !!user;

const normalizeDailyUnlockState = (settings: UserSettings): UserSettings => {
  let selectedPaletteId = settings.selectedPaletteId;
  const selectedPalette = paletteService.getPaletteById(selectedPaletteId);
  if (!selectedPalette) {
    selectedPaletteId = DEFAULT_SETTINGS.selectedPaletteId;
  }

  return {
    ...settings,
    isPremium: true,
    selectedPaletteId,
  };
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [syncState, setSyncState] = useState<SyncState>({ inProgress: false });
  const [authUser, setAuthUser] = useState<User | null>(authService.getCurrentUser());
  const [authLoading, setAuthLoading] = useState(true);

  const refreshAll = async () => {
    const [allEntries, userSettings] = await Promise.all([
      moodEntryRepository.getAll(),
      userSettingsRepository.get(),
    ]);

    setEntries(allEntries);
    setSettings(normalizeDailyUnlockState(userSettings));
    setSyncState((prev) => ({
      ...prev,
      lastSyncedAt: userSettings.cloudLastSyncedAt,
    }));
  };

  const rescheduleReminder = async (nextSettings: UserSettings, nextEntries: MoodEntry[]) => {
    const hasTodayEntry = nextEntries.some((entry) => entry.date === getTodayKey());

    await notificationService.rescheduleDailyReminder({
      enabled: nextSettings.notificationsEnabled,
      reminderTime: nextSettings.reminderTime,
      hasTodayEntry,
    });
  };

  const runSyncInternal = async (options?: { silent?: boolean; user?: User | null; force?: boolean }) => {
    const user = options?.user ?? authUser;
    if (!user || (!settings.cloudSyncEnabled && !options?.force)) {
      return;
    }

    if (!options?.silent) {
      setSyncState((prev) => ({ ...prev, inProgress: true, error: undefined }));
    }

    try {
      const result = await syncService.mergeAndSync(user.uid);
      await userSettingsRepository.update({ cloudLastSyncedAt: result.syncedAt });
      await refreshAll();

      setSyncState({
        inProgress: false,
        lastSyncedAt: result.syncedAt,
        syncedCount: result.syncedCount,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed';
      setSyncState((prev) => ({
        ...prev,
        inProgress: false,
        error: message,
      }));
      if (!options?.silent) {
        throw error;
      }
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await initDb();

        const [allEntries, userSettings] = await Promise.all([
          moodEntryRepository.getAll(),
          userSettingsRepository.get(),
        ]);

        const mergedSettings = normalizeDailyUnlockState({
          ...userSettings,
          isPremium: true,
        });

        if (
          mergedSettings.isPremium !== userSettings.isPremium ||
          mergedSettings.selectedPaletteId !== userSettings.selectedPaletteId
        ) {
          await userSettingsRepository.update({
            isPremium: mergedSettings.isPremium,
            selectedPaletteId: mergedSettings.selectedPaletteId,
          });
        }

        setEntries(allEntries);
        setSettings(mergedSettings);
        setSyncState((prev) => ({
          ...prev,
          lastSyncedAt: mergedSettings.cloudLastSyncedAt,
        }));

        await rescheduleReminder(mergedSettings, allEntries);
      } catch (error) {
        console.error('App bootstrap failed:', error);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const unsubscribe = authService.observeAuthState((user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const saveTodayMood: AppContextValue['saveTodayMood'] = async ({ moodId, note }) => {
    const normalizedSettings = normalizeDailyUnlockState(settings);
    if (normalizedSettings.selectedPaletteId !== settings.selectedPaletteId) {
      await userSettingsRepository.update({
        selectedPaletteId: normalizedSettings.selectedPaletteId,
      });
      setSettings(normalizedSettings);
    }

    await moodService.saveTodayEntry({
      moodId,
      paletteId: normalizedSettings.selectedPaletteId,
      note,
    });

    const nextEntries = await moodEntryRepository.getAll();
    setEntries(nextEntries);
    await rescheduleReminder(normalizedSettings, nextEntries);

    if (shouldSyncInBackground(normalizedSettings, authUser)) {
      void runSyncInternal({ silent: true });
    }
  };

  const updateSettings: AppContextValue['updateSettings'] = async (partial) => {
    await userSettingsRepository.update(partial);
    const nextSettings = normalizeDailyUnlockState(await userSettingsRepository.get());
    setSettings(nextSettings);

    await rescheduleReminder(nextSettings, entries);

    if (
      shouldSyncInBackground(nextSettings, authUser) &&
      (partial.selectedPaletteId !== undefined ||
        partial.notificationsEnabled !== undefined ||
        partial.reminderTime !== undefined)
    ) {
      void runSyncInternal({ silent: true });
    }
  };

  const completeOnboarding: AppContextValue['completeOnboarding'] = async (partial) => {
    await userSettingsRepository.update({
      ...partial,
      hasCompletedOnboarding: true,
    });
    const nextSettings = normalizeDailyUnlockState(await userSettingsRepository.get());
    setSettings(nextSettings);
    await rescheduleReminder(nextSettings, entries);
  };

  const runSync = async () => {
    await runSyncInternal();
  };

  const connectCloudAccount = async () => {
    const signedInUser = await authService.signInForPlatform();
    await userSettingsRepository.update({ cloudSyncEnabled: true });
    const nextSettings = normalizeDailyUnlockState(await userSettingsRepository.get());
    setSettings(nextSettings);
    await runSyncInternal({ user: signedInUser, force: true });
  };

  const disconnectCloudAccount = async () => {
    await authService.signOut();
    await userSettingsRepository.update({ cloudSyncEnabled: false });
    const nextSettings = normalizeDailyUnlockState(await userSettingsRepository.get());
    setSettings(nextSettings);
  };

  const deletePremiumCloudAccount = async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('No connected account found.');
    }

    await syncService.deleteAccount(user.uid);
    await authService.deleteCurrentUser();
    await userSettingsRepository.update({
      cloudSyncEnabled: false,
      cloudLastSyncedAt: undefined,
    });
    const nextSettings = normalizeDailyUnlockState(await userSettingsRepository.get());
    setSettings(nextSettings);
    setSyncState({ inProgress: false });
  };

  const getEntryByDate = (date: string) => {
    return entries.find((entry) => entry.date === date);
  };

  const authState: AuthState = useMemo(
    () => ({
      loading: authLoading,
      isSignedIn: !!authUser,
      userId: authUser?.uid,
      provider: authService.getProviderLabel(authUser),
    }),
    [authLoading, authUser],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      loading,
      entries,
      settings,
      syncState,
      authState,
      needsOnboarding: !settings.hasCompletedOnboarding,
      refreshAll,
      saveTodayMood,
      updateSettings,
      completeOnboarding,
      runSync,
      connectCloudAccount,
      disconnectCloudAccount,
      deletePremiumCloudAccount,
      getEntryByDate,
    }),
    [loading, entries, settings, syncState, authState],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider.');
  }

  return context;
};
