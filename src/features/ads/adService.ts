import { Platform } from 'react-native';
import mobileAds, { AdEventType, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

import { INTEGRATIONS } from '@/src/constants/integrations';

let initialized = false;

const getRewardedUnitId = () => {
  if (Platform.OS === 'ios') {
    return INTEGRATIONS.admob.rewardedAdUnitIdIOS;
  }
  return INTEGRATIONS.admob.rewardedAdUnitIdAndroid;
};

export const adService = {
  async initialize(): Promise<void> {
    if (Platform.OS === 'web' || initialized) {
      return;
    }

    await mobileAds().initialize();
    initialized = true;
  },

  async showRewardedAd(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    await this.initialize();

    return new Promise<boolean>((resolve) => {
      const rewarded = RewardedAd.createForAdRequest(getRewardedUnitId(), {
        requestNonPersonalizedAdsOnly: true,
      });

      let settled = false;

      const settle = (result: boolean) => {
        if (!settled) {
          settled = true;
          resolve(result);
        }
      };

      const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        rewarded.show();
      });

      const unsubscribeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        settle(true);
      });

      const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        settle(false);
      });

      const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, () => {
        settle(false);
      });

      rewarded.load();

      setTimeout(() => {
        settle(false);
      }, 30000);

      const cleanup = () => {
        unsubscribeLoaded();
        unsubscribeEarned();
        unsubscribeClosed();
        unsubscribeError();
      };

      const interval = setInterval(() => {
        if (settled) {
          cleanup();
          clearInterval(interval);
        }
      }, 200);
    });
  },

  async showRewardedForHdExport(): Promise<boolean> {
    return this.showRewardedAd();
  },
};
