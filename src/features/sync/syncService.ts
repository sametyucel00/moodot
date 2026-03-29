import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

import { getFirebaseFirestore } from '@/src/features/firebase/firebaseClient';
import type { MoodEntry, UserSettings } from '@/src/types';

type SyncableSettings = Pick<UserSettings, 'selectedPaletteId' | 'notificationsEnabled' | 'reminderTime'>;

export interface LocalMoodRepository {
  getAll(): Promise<MoodEntry[]>;
  upsertMany(entries: MoodEntry[]): Promise<void>;
}

export interface LocalSettingsRepository {
  get(): Promise<UserSettings>;
  update(partial: Partial<UserSettings>): Promise<void>;
}

export interface RemoteSyncRepository {
  getEntries(userId: string): Promise<MoodEntry[]>;
  upsertEntries(userId: string, entries: MoodEntry[]): Promise<void>;
  getSettings(userId: string): Promise<(SyncableSettings & { updatedAt: string }) | null>;
  upsertSettings(userId: string, settings: SyncableSettings & { updatedAt: string }): Promise<void>;
  deleteUserData(userId: string): Promise<void>;
}

type RemoteMoodEntryDoc = {
  dateKey: string;
  moodId: MoodEntry['moodId'];
  colorHex: string;
  paletteId: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

const parseIsoMs = (value: string | undefined): number => {
  if (!value) {
    return 0;
  }
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? 0 : ms;
};

const pickNewestEntry = (left: MoodEntry, right: MoodEntry): MoodEntry => {
  return parseIsoMs(left.updatedAt) >= parseIsoMs(right.updatedAt) ? left : right;
};

const mergeEntries = (localEntries: MoodEntry[], remoteEntries: MoodEntry[]): MoodEntry[] => {
  const byDate = new Map<string, MoodEntry>();

  for (const entry of localEntries) {
    byDate.set(entry.date, entry);
  }

  for (const remote of remoteEntries) {
    const existing = byDate.get(remote.date);
    if (!existing) {
      byDate.set(remote.date, remote);
      continue;
    }
    byDate.set(remote.date, pickNewestEntry(existing, remote));
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
};

const mergeSettings = (
  local: SyncableSettings & { updatedAt: string },
  remote: (SyncableSettings & { updatedAt: string }) | null,
): SyncableSettings & { updatedAt: string } => {
  if (!remote) {
    return local;
  }

  if (parseIsoMs(local.updatedAt) >= parseIsoMs(remote.updatedAt)) {
    return local;
  }

  return remote;
};

export class FirestoreRemoteSyncRepository implements RemoteSyncRepository {
  private firestore: Firestore;

  constructor(firestore: Firestore = getFirebaseFirestore()) {
    this.firestore = firestore;
  }

  async getEntries(userId: string): Promise<MoodEntry[]> {
    const snapshot = await getDocs(collection(this.firestore, 'users', userId, 'entries'));
    return snapshot.docs
      .map((entryDoc) => {
        const data = entryDoc.data() as RemoteMoodEntryDoc;
        return {
          id: `entry-${data.dateKey}`,
          date: data.dateKey,
          moodId: data.moodId,
          colorHex: data.colorHex,
          paletteId: data.paletteId,
          note: data.note,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as MoodEntry;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async upsertEntries(userId: string, entries: MoodEntry[]): Promise<void> {
    if (!entries.length) {
      return;
    }

    const batch = writeBatch(this.firestore);
    for (const entry of entries) {
      const ref = doc(this.firestore, 'users', userId, 'entries', entry.date);
      const payload: RemoteMoodEntryDoc = {
        dateKey: entry.date,
        moodId: entry.moodId,
        colorHex: entry.colorHex,
        paletteId: entry.paletteId,
        note: entry.note?.trim() || undefined,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      };
      batch.set(ref, payload, { merge: true });
    }
    await batch.commit();
  }

  async getSettings(userId: string): Promise<(SyncableSettings & { updatedAt: string }) | null> {
    const ref = doc(this.firestore, 'users', userId, 'settings', 'profile');
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as SyncableSettings & { updatedAt: string };
    return {
      selectedPaletteId: data.selectedPaletteId,
      notificationsEnabled: Boolean(data.notificationsEnabled),
      reminderTime: data.reminderTime,
      updatedAt: data.updatedAt,
    };
  }

  async upsertSettings(userId: string, settings: SyncableSettings & { updatedAt: string }): Promise<void> {
    const ref = doc(this.firestore, 'users', userId, 'settings', 'profile');
    await setDoc(ref, settings, { merge: true });
  }

  async deleteUserData(userId: string): Promise<void> {
    const deleteCollectionInChunks = async (collectionPath: string) => {
      while (true) {
        const snapshot = await getDocs(query(collection(this.firestore, collectionPath), limit(400)));
        if (snapshot.empty) {
          break;
        }
        const batch = writeBatch(this.firestore);
        snapshot.docs.forEach((item) => batch.delete(item.ref));
        await batch.commit();
      }
    };

    await deleteCollectionInChunks(`users/${userId}/entries`);
    await deleteCollectionInChunks(`users/${userId}/settings`);
  }
}

export type CloudSyncResult = {
  syncedCount: number;
  syncedAt: string;
};

export const createSyncService = (params: {
  localMoodRepository: LocalMoodRepository;
  localSettingsRepository: LocalSettingsRepository;
  remoteRepository: RemoteSyncRepository;
}) => ({
  async mergeAndSync(userId: string): Promise<CloudSyncResult> {
    const [localEntries, remoteEntries, localSettings, remoteSettings] = await Promise.all([
      params.localMoodRepository.getAll(),
      params.remoteRepository.getEntries(userId),
      params.localSettingsRepository.get(),
      params.remoteRepository.getSettings(userId),
    ]);

    const mergedEntries = mergeEntries(localEntries, remoteEntries);
    const mergedSettings = mergeSettings(
      {
        selectedPaletteId: localSettings.selectedPaletteId,
        notificationsEnabled: localSettings.notificationsEnabled,
        reminderTime: localSettings.reminderTime,
        updatedAt: localSettings.settingsUpdatedAt,
      },
      remoteSettings,
    );

    await params.localMoodRepository.upsertMany(mergedEntries);
    await params.localSettingsRepository.update({
      ...mergedSettings,
      settingsUpdatedAt: mergedSettings.updatedAt,
    });

    await Promise.all([
      params.remoteRepository.upsertEntries(userId, mergedEntries),
      params.remoteRepository.upsertSettings(userId, mergedSettings),
    ]);

    return {
      syncedAt: new Date().toISOString(),
      syncedCount: mergedEntries.length,
    };
  },

  async deleteAccount(userId: string): Promise<void> {
    await params.remoteRepository.deleteUserData(userId);
  },
});
