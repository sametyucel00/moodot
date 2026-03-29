const readPublic = (value: string | undefined, fallback: string, key: string): string => {
  const resolved = value ?? fallback;
  if (!resolved) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return resolved;
};

export const INTEGRATIONS = {
  admob: {
    rewardedAdUnitIdAndroid: readPublic(
      process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID_ID,
      'ca-app-pub-7422131853794926/7278716290',
      'EXPO_PUBLIC_ADMOB_REWARDED_ANDROID_ID',
    ),
    rewardedAdUnitIdIOS: readPublic(
      process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS_ID,
      'ca-app-pub-7422131853794926/1810767196',
      'EXPO_PUBLIC_ADMOB_REWARDED_IOS_ID',
    ),
  },
  revenueCat: {
    apiKeyIOS: readPublic(
      process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
      'appl_pMzObikfxHAqUtUJpjeEqeyQzyZ',
      'EXPO_PUBLIC_REVENUECAT_API_KEY_IOS',
    ),
    apiKeyAndroid: readPublic(
      process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID,
      'goog_TXWyhepaakGSWPDLDOCgddrqoFv',
      'EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID',
    ),
    premiumProductId: readPublic(
      process.env.EXPO_PUBLIC_REVENUECAT_PRODUCT_ID,
      'proj24acd7ca',
      'EXPO_PUBLIC_REVENUECAT_PRODUCT_ID',
    ),
  },
  firebase: {
    apiKey: readPublic(
      process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      'AIzaSyDVrufUynAnWdA7dBZ7PZjXYK6WcslU9r8',
      'EXPO_PUBLIC_FIREBASE_API_KEY',
    ),
    authDomain: readPublic(
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      'nar-rehberi-pro.firebaseapp.com',
      'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    ),
    databaseURL: readPublic(
      process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
      'https://nar-rehberi-pro-default-rtdb.firebaseio.com',
      'EXPO_PUBLIC_FIREBASE_DATABASE_URL',
    ),
    projectId: readPublic(
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      'nar-rehberi-pro',
      'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    ),
    storageBucket: readPublic(
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      'nar-rehberi-pro.firebasestorage.app',
      'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    ),
    messagingSenderId: readPublic(
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      '712568563076',
      'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    ),
    appId: readPublic(
      process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      '1:712568563076:web:a9c6f80d4ba8f5f4fe29d1',
      'EXPO_PUBLIC_FIREBASE_APP_ID',
    ),
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    moodotRoot: readPublic(process.env.EXPO_PUBLIC_FIREBASE_MOODOT_ROOT, 'moodot', 'EXPO_PUBLIC_FIREBASE_MOODOT_ROOT'),
    googleWebClientId: process.env.EXPO_PUBLIC_FIREBASE_GOOGLE_WEB_CLIENT_ID,
    firestoreDatabaseId: readPublic(
      process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID,
      'mood',
      'EXPO_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID',
    ),
  },
} as const;
