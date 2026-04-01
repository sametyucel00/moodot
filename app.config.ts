import type { ExpoConfig } from 'expo/config';

const getEnv = (name: string, fallback?: string): string => {
  const value = process.env[name];
  if (value) {
    return value;
  }
  if (fallback) {
    return fallback;
  }
  throw new Error(`Missing required environment variable: ${name}`);
};

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (value) {
    return value;
  }
  // Allow easier EAS bootstrapping before env variables are pushed.
  if (process.env.CI || process.env.EAS_BUILD || process.env.EAS_NO_VCS) {
    return '';
  }
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const config: ExpoConfig = {
  name: 'Moodot',
  slug: 'moodot',
  description: 'Color your days, see your life.',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'moodot',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#FCFCFA',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.moodot',
    usesAppleSignIn: true,
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      CFBundleDisplayName: 'Moodot',
      CFBundleName: 'Moodot',
      CFBundleAllowMixedLocalizations: true,
      SKAdNetworkItems: [
        { SKAdNetworkIdentifier: 'cstr6suwn9.skadnetwork' },
        { SKAdNetworkIdentifier: '4fzdc2evr5.skadnetwork' },
        { SKAdNetworkIdentifier: '2fnua5tdw4.skadnetwork' },
        { SKAdNetworkIdentifier: 'ydx93a7ass.skadnetwork' },
        { SKAdNetworkIdentifier: 'p78axxw29g.skadnetwork' },
        { SKAdNetworkIdentifier: 'v72qych5uu.skadnetwork' },
        { SKAdNetworkIdentifier: 'ludvb6z3bs.skadnetwork' },
        { SKAdNetworkIdentifier: 'cp8zw746q7.skadnetwork' },
        { SKAdNetworkIdentifier: '3sh42y64q3.skadnetwork' },
        { SKAdNetworkIdentifier: 'c6k4g5qg8m.skadnetwork' },
        { SKAdNetworkIdentifier: 's39g8k73mm.skadnetwork' },
        { SKAdNetworkIdentifier: 'wg4vff78zm.skadnetwork' },
        { SKAdNetworkIdentifier: '3qy4746246.skadnetwork' },
        { SKAdNetworkIdentifier: 'f38h382jlk.skadnetwork' },
        { SKAdNetworkIdentifier: 'hs6bdukanm.skadnetwork' },
        { SKAdNetworkIdentifier: 'mlmmfzh3r3.skadnetwork' },
        { SKAdNetworkIdentifier: 'v4nxqhlyqp.skadnetwork' },
        { SKAdNetworkIdentifier: 'wzmmz9fp6w.skadnetwork' },
        { SKAdNetworkIdentifier: 'su67r6k2v3.skadnetwork' },
        { SKAdNetworkIdentifier: 'yclnxrl5pm.skadnetwork' },
        { SKAdNetworkIdentifier: 't38b2kh725.skadnetwork' },
        { SKAdNetworkIdentifier: '7ug5zh24hu.skadnetwork' },
        { SKAdNetworkIdentifier: 'gta9lk7p23.skadnetwork' },
        { SKAdNetworkIdentifier: 'vutu7akeur.skadnetwork' },
        { SKAdNetworkIdentifier: 'y5ghdn5j9k.skadnetwork' },
        { SKAdNetworkIdentifier: 'v9wttpbfk9.skadnetwork' },
        { SKAdNetworkIdentifier: 'n38lu8286q.skadnetwork' },
        { SKAdNetworkIdentifier: '47vhws6wlr.skadnetwork' },
        { SKAdNetworkIdentifier: 'kbd757ywx3.skadnetwork' },
        { SKAdNetworkIdentifier: '9t245vhmpl.skadnetwork' },
        { SKAdNetworkIdentifier: 'a2p9lx4jpn.skadnetwork' },
        { SKAdNetworkIdentifier: '22mmun2rn5.skadnetwork' },
        { SKAdNetworkIdentifier: '44jx6755aq.skadnetwork' },
        { SKAdNetworkIdentifier: 'k674qkevps.skadnetwork' },
        { SKAdNetworkIdentifier: '4468km3ulz.skadnetwork' },
        { SKAdNetworkIdentifier: '2u9pt9hc89.skadnetwork' },
        { SKAdNetworkIdentifier: '8s468mfl3y.skadnetwork' },
        { SKAdNetworkIdentifier: 'klf5c3l5u5.skadnetwork' },
        { SKAdNetworkIdentifier: 'ppxm28t8ap.skadnetwork' },
        { SKAdNetworkIdentifier: 'kbmxgpxpgc.skadnetwork' },
        { SKAdNetworkIdentifier: 'uw77j35x4d.skadnetwork' },
        { SKAdNetworkIdentifier: '578prtvx9j.skadnetwork' },
        { SKAdNetworkIdentifier: '4dzt52r2t5.skadnetwork' },
        { SKAdNetworkIdentifier: 'tl55sbb4fm.skadnetwork' },
        { SKAdNetworkIdentifier: 'c3frkrj4fj.skadnetwork' },
        { SKAdNetworkIdentifier: 'e5fvkxwrpn.skadnetwork' },
        { SKAdNetworkIdentifier: '8c4e2ghe7u.skadnetwork' },
        { SKAdNetworkIdentifier: '3rd42ekr43.skadnetwork' },
        { SKAdNetworkIdentifier: '97r2b46745.skadnetwork' },
        { SKAdNetworkIdentifier: '3qcr597p9d.skadnetwork' },
      ],
    },
  },
  android: {
    package: 'com.moodot',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  androidStatusBar: {
    hidden: true,
  },
  androidNavigationBar: {
    visible: 'immersive',
    backgroundColor: '#00000000',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-sharing',
    'expo-apple-authentication',
    [
      'expo-notifications',
      {
        enableBackgroundRemoteNotifications: false,
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: getEnv('ADMOB_ANDROID_APP_ID', 'ca-app-pub-7422131853794926~4620763369'),
        iosAppId: getEnv('ADMOB_IOS_APP_ID', 'ca-app-pub-7422131853794926~9657467623'),
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: '30e72ade-4f91-4053-af04-593c8909d521',
    },
  },
};

export default config;
