import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesStoreProduct } from 'react-native-purchases';

import { INTEGRATIONS } from '@/src/constants/integrations';
import type { PremiumProductKind, PremiumProductOption } from '@/src/types';

export type Plan = 'free' | 'premium';

let configured = false;

const isTestRevenueCatKey = (apiKey: string): boolean => apiKey.startsWith('test_');

const getRevenueCatApiKey = (): string => {
  if (Platform.OS === 'ios') {
    return INTEGRATIONS.revenueCat.apiKeyIOS;
  }
  return INTEGRATIONS.revenueCat.apiKeyAndroid;
};

const productConfigByKind: Record<
  PremiumProductKind,
  Pick<PremiumProductOption, 'title' | 'subtitle' | 'badge' | 'isSubscription'> & { productId: string }
> = {
  monthly: {
    productId: INTEGRATIONS.revenueCat.monthlyProductId,
    title: 'Monthly',
    subtitle: 'Flexible premium access',
    isSubscription: true,
  },
  yearly: {
    productId: INTEGRATIONS.revenueCat.yearlyProductId,
    title: 'Yearly',
    subtitle: 'Best value for ongoing journaling',
    badge: 'Best value',
    isSubscription: true,
  },
  lifetime: {
    productId: INTEGRATIONS.revenueCat.lifetimeProductId,
    title: 'Lifetime',
    subtitle: 'One purchase, permanent premium',
    badge: 'Forever',
    isSubscription: false,
  },
};

const getAllProductIds = () =>
  Object.values(productConfigByKind).map((product) => product.productId);

const hasPremiumAccess = (customerInfo: CustomerInfo): boolean => {
  if (Object.keys(customerInfo.entitlements.active).length > 0) {
    return true;
  }

  const knownProductIds = getAllProductIds();
  const nonSubscriptionTransactions = customerInfo.nonSubscriptionTransactions ?? [];

  return knownProductIds.some(
    (productId) =>
      customerInfo.activeSubscriptions.includes(productId) ||
      nonSubscriptionTransactions.some((transaction) => transaction.productIdentifier === productId),
  );
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

  async getPremiumProducts(): Promise<PremiumProductOption[]> {
    const fallbackProducts = Object.entries(productConfigByKind).map(([kind, config]) => ({
      kind: kind as PremiumProductKind,
      ...config,
    }));

    if (Platform.OS === 'web') {
      return fallbackProducts;
    }

    await this.initialize();
    if (!configured) {
      return fallbackProducts;
    }

    const storeProducts = await Purchases.getProducts(getAllProductIds());

    return fallbackProducts.map((option) => {
      const storeProduct = storeProducts.find((item) => item.identifier === option.productId);

      return {
        ...option,
        price: storeProduct?.priceString,
      };
    });
  },

  async purchasePremium(kind: PremiumProductKind): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    await this.initialize();
    if (!configured) {
      return false;
    }

    const selectedProductId = productConfigByKind[kind].productId;
    const products = await Purchases.getProducts([selectedProductId]);
    const product: PurchasesStoreProduct | undefined = products[0];

    if (!product) {
      throw new Error(`${productConfigByKind[kind].title} product not found in RevenueCat dashboard.`);
    }

    const result = await Purchases.purchaseStoreProduct(product);
    return hasPremiumAccess(result.customerInfo);
  },
};
