export type MoodId =
  | 'happy'
  | 'calm'
  | 'balanced'
  | 'energetic'
  | 'thoughtful'
  | 'tired';

export type MoodEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  moodId: MoodId;
  paletteId: string;
  colorHex: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type MoodDefinition = {
  id: MoodId;
  label: string;
  defaultHex: string;
};

export type PaletteColor = {
  moodId: MoodId;
  hex: string;
};

export type Palette = {
  id: string;
  name: string;
  isPremium: boolean;
  colors: PaletteColor[];
};

export type UserSettings = {
  selectedPaletteId: string;
  notificationsEnabled: boolean;
  reminderTime: string; // HH:mm
  isPremium: boolean;
  hasCompletedOnboarding: boolean;
  settingsUpdatedAt: string;
  cloudSyncEnabled: boolean;
  cloudLastSyncedAt?: string;
  adPaletteUnlockDate?: string;
  adPremiumCardsUnlockDate?: string;
};

export type PremiumProductKind = 'monthly' | 'yearly' | 'lifetime';

export type PremiumProductOption = {
  kind: PremiumProductKind;
  productId: string;
  title: string;
  subtitle: string;
  badge?: string;
  isSubscription: boolean;
  price?: string;
};
