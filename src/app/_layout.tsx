import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

import { InAppNoticeHost } from '@/src/components/InAppNoticeHost';
import { AppProvider } from '@/src/features/app/AppContext';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  React.useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const configureFullscreen = async () => {
      try {
        await NavigationBar.setBehaviorAsync('overlay-swipe');
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setPositionAsync('absolute');
        await NavigationBar.setBackgroundColorAsync('#00000000');
      } catch {
        // Ignore navigation bar failures on unsupported devices.
      }
    };

    configureFullscreen();
  }, []);

  return (
    <AppProvider>
      <StatusBar hidden />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
      <InAppNoticeHost />
    </AppProvider>
  );
}
