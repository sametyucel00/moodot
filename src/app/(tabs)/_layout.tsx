import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '@/src/constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        sceneStyle: {
          backgroundColor: '#FCFCFA',
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: '#8C8C8C',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#ECE7E0',
          borderTopWidth: 1,
          height: isTablet ? 72 + insets.bottom : 64 + insets.bottom,
          paddingTop: isTablet ? 8 : 5,
          paddingBottom: Math.max(isTablet ? 14 : 10, insets.bottom + (isTablet ? 10 : 8)),
          paddingHorizontal: isTablet ? 24 : 8,
          marginHorizontal: isTablet ? Math.max(28, width * 0.16) : 0,
          marginBottom: Platform.OS === 'ios' && isTablet ? 12 : 0,
          borderRadius: isTablet ? 22 : 0,
          position: isTablet ? 'absolute' : 'relative',
          left: isTablet ? 0 : undefined,
          right: isTablet ? 0 : undefined,
          bottom: isTablet ? 0 : undefined,
          shadowColor: '#000000',
          shadowOpacity: isTablet ? 0.05 : 0,
          shadowRadius: isTablet ? 14 : 0,
          shadowOffset: { width: 0, height: 8 },
          elevation: isTablet ? 6 : 0,
        },
        tabBarLabelStyle: {
          fontSize: isTablet ? 12.5 : 12,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          borderRadius: 14,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: COLORS.textPrimary,
          fontWeight: '600',
        },
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <Ionicons name="color-palette-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
