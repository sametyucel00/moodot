import { MOOD_DEFINITIONS, PALETTES } from '@/src/constants/mood';
import type { MoodId, Palette } from '@/src/types';

export const paletteService = {
  getMoodDefinitions() {
    return MOOD_DEFINITIONS;
  },

  getAllPalettes() {
    return PALETTES;
  },

  getPaletteById(paletteId: string): Palette | undefined {
    return PALETTES.find((palette) => palette.id === paletteId);
  },

  getAvailablePalettes(): Palette[] {
    return PALETTES;
  },

  getColorHex(paletteId: string, moodId: MoodId): string {
    const palette = this.getPaletteById(paletteId) ?? PALETTES[0];
    const color = palette.colors.find((item) => item.moodId === moodId);
    if (!color) {
      const fallback = MOOD_DEFINITIONS.find((item) => item.id === moodId);
      return fallback?.defaultHex ?? '#C6C6C6';
    }
    return color.hex;
  },
};
