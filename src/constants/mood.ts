import type { MoodDefinition, MoodId, Palette } from '@/src/types';

export const APP_COPY = {
  name: 'Moodot',
  subtitle: 'Color your days, see your life',
  firstSentence: 'One color a day. A year of your life in colors.',
};

export const MOOD_DEFINITIONS: MoodDefinition[] = [
  { id: 'happy', label: 'Happy', defaultHex: '#FFD93D' },
  { id: 'calm', label: 'Calm', defaultHex: '#4D96FF' },
  { id: 'balanced', label: 'Balanced', defaultHex: '#6BCB77' },
  { id: 'energetic', label: 'Energetic', defaultHex: '#FF9F1C' },
  { id: 'thoughtful', label: 'Thoughtful', defaultHex: '#9D4EDD' },
  { id: 'tired', label: 'Low energy', defaultHex: '#ADB5BD' },
];

const moodIds: MoodId[] = MOOD_DEFINITIONS.map((mood) => mood.id);

const makePalette = (
  id: string,
  name: string,
<<<<<<< HEAD
  isPremium: boolean,
=======
>>>>>>> 7493727 (Initial Moodot app setup)
  hexes: string[],
): Palette => ({
  id,
  name,
<<<<<<< HEAD
  isPremium,
=======
>>>>>>> 7493727 (Initial Moodot app setup)
  colors: moodIds.map((moodId, index) => ({ moodId, hex: hexes[index] })),
});

export const PALETTES: Palette[] = [
<<<<<<< HEAD
  makePalette('classic', 'Classic', false, ['#FFD93D', '#4D96FF', '#6BCB77', '#FF9F1C', '#9D4EDD', '#ADB5BD']),
  makePalette('pastel', 'Pastel', false, ['#FFE680', '#86B9FF', '#9BE0A3', '#FFBF70', '#BC8AF3', '#C8CED3']),
  makePalette('night', 'Night', false, ['#CFAE27', '#3B7CDD', '#53A861', '#D98514', '#7E33C7', '#87929A']),
  makePalette('sunset', 'Sunset', true, ['#FFCF52', '#5EA5FF', '#79D383', '#FFAF3D', '#AF66F2', '#B8C0C7']),
  makePalette('forest', 'Forest', true, ['#E6C534', '#4A8DE8', '#5DBE69', '#F09521', '#9243DE', '#A1ABB3']),
=======
  makePalette('classic', 'Classic', ['#FFD93D', '#4D96FF', '#6BCB77', '#FF9F1C', '#9D4EDD', '#ADB5BD']),
  makePalette('pastel', 'Pastel', ['#FFE680', '#86B9FF', '#9BE0A3', '#FFBF70', '#BC8AF3', '#C8CED3']),
  makePalette('night', 'Night', ['#CFAE27', '#3B7CDD', '#53A861', '#D98514', '#7E33C7', '#87929A']),
  makePalette('sunset', 'Sunset', ['#FFCF52', '#5EA5FF', '#79D383', '#FFAF3D', '#AF66F2', '#B8C0C7']),
  makePalette('forest', 'Forest', ['#E6C534', '#4A8DE8', '#5DBE69', '#F09521', '#9243DE', '#A1ABB3']),
>>>>>>> 7493727 (Initial Moodot app setup)
];

export const DEFAULT_SETTINGS = {
  selectedPaletteId: 'classic',
  notificationsEnabled: true,
  reminderTime: '20:30',
<<<<<<< HEAD
  isPremium: true,
=======
>>>>>>> 7493727 (Initial Moodot app setup)
  hasCompletedOnboarding: false,
  settingsUpdatedAt: new Date(0).toISOString(),
  cloudSyncEnabled: false,
  cloudLastSyncedAt: undefined,
<<<<<<< HEAD
  adPaletteUnlockDate: undefined,
  adPremiumCardsUnlockDate: undefined,
=======
>>>>>>> 7493727 (Initial Moodot app setup)
};

export const REMINDER_MESSAGES = [
  'Which color is your day today?',
  'Would you like to choose your color of the day?',
<<<<<<< HEAD
];
=======
];
>>>>>>> 7493727 (Initial Moodot app setup)
