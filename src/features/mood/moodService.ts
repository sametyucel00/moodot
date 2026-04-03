import { getTodayKey } from '@/src/features/mood/dateUtils';
import { paletteService } from '@/src/features/palette/paletteService';
import { moodEntryRepository } from '@/src/storage/repositories/moodEntryRepository';
import type { MoodId } from '@/src/types';

export const moodService = {
  async saveTodayEntry(params: {
    moodId: MoodId;
    paletteId: string;
    note?: string;
  }): Promise<void> {
    const date = getTodayKey();
    const colorHex = paletteService.getColorHex(params.paletteId, params.moodId);

    await moodEntryRepository.upsertByDate({
      date,
      moodId: params.moodId,
      paletteId: params.paletteId,
      colorHex,
      note: params.note,
    });
  },
<<<<<<< HEAD
};
=======
};
>>>>>>> 7493727 (Initial Moodot app setup)
