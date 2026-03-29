import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { APP_COPY } from '@/src/constants/mood';

export const AppSplash = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{APP_COPY.name}</Text>
      <Text style={styles.subtitle}>{APP_COPY.subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFA',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#121212',
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6A6A6A',
    textAlign: 'center',
  },
});

