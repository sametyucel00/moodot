import { captureRef } from 'react-native-view-shot';

export type ExportQuality = 'standard' | 'hd';

export const exportService = {
  async exportMosaicFromView(params: {
    viewRef: React.RefObject<unknown>;
    quality: ExportQuality;
    isPremium: boolean;
    unlockHdWithAd: () => Promise<boolean>;
  }): Promise<string> {
    if (params.quality === 'hd' && !params.isPremium) {
      const unlocked = await params.unlockHdWithAd();
      if (!unlocked) {
        throw new Error('HD export was not unlocked.');
      }
    }

    const width = params.quality === 'hd' ? 3072 : 2048;
    const height = params.quality === 'hd' ? 4096 : 2732;
    const current = params.viewRef.current as { capture?: (options?: object) => Promise<string> } | null;

    if (!current) {
      throw new Error('Export preview is still preparing. Try again in a moment.');
    }

    await new Promise((resolve) => setTimeout(resolve, 80));

    let uri: string;
    if (current?.capture) {
      uri = await current.capture({
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        width,
        height,
      });
    } else {
      uri = await captureRef(current as never, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        width,
        height,
      });
    }

    if (!uri) {
      throw new Error('Could not create export image.');
    }

    return uri;
  },
};
