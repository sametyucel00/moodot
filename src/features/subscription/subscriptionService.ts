import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesStoreProduct } from 'react-native-purchases';

import { INTEGRATIONS } from '@/src/constants/integrations';

export type Plan = 'free' | 'premium';

let configured = false;

const isTestRevenueCatKey = (apiKey: string): boolean => apiKey.startsWith('test_');

const getRevenueCatApiKey = (): string => {
  if (Platform.OS === 'ios') {
    return INTEGRATIONS.revenueCat.apiKeyIOS;
  }
  return INTEGRATIONS.revenueCat.apiKeyAndroid;
};

const hasPremiumAccess = (customerInfo: CustomerInfo): boolean => {
  if (Object.keys(customerInfo.entitlements.active).length > 0) {
    return true;
  }

  return customerInfo.activeSubscriptions.includes(INTEGRATIONS.revenueCat.premiumProductId);
};

export const subscriptionService = {
  getPlan(isPremium: boolean): Plan {
    return isPremium ? 'premium' : 'free';
  },

  async initialize(): Promise<void> {
    if (Platform.OS === 'web' || configured) {
      return;
    }

    const apiKey = getRevenueCatApiKey();

    // RevenueCat test keys crash release builds by design. Skip init safely.
    if (!__DEV__ && isTestRevenueCatKey(apiKey)) {
      console.warn(
        'RevenueCat test API key is configured in release. Purchases disabled until production key is set.',
      );
      return;
    }

    await Purchases.configure({
      apiKey,
    });

    configured = true;
  },

  async isPremiumActive(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    await this.initialize();
    if (!configured) {
      return false;
    }
    const info = await Purchases.getCustomerInfo();
    return hasPremiumAccess(info);
  },

  async purchasePremium(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    await this.initialize();
    if (!configured) {
      return false;
    }

    const products = await Purchases.getProducts([INTEGRATIONS.revenueCat.premiumProductId]);
    const product: PurchasesStoreProduct | undefined = products[0];

    if (!product) {
      throw new Error('Premium product not found in RevenueCat dashboard.');
    }

    const result = await Purchases.purchaseStoreProduct(product);
    return hasPremiumAccess(result.customerInfo);
  },
};
