import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Moodot',
  slug: 'moodot',
  description: 'Color your days, see your life.',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/android-icon-foreground.png',
  scheme: 'moodot',
  userInterfaceStyle: 'automatic',
  splash: {
    backgroundColor: '#FCFCFA',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.moodot',
    usesAppleSignIn: true,
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      CFBundleDisplayName: 'Moodot',
      CFBundleName: 'Moodot',
      CFBundleAllowMixedLocalizations: true,
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
