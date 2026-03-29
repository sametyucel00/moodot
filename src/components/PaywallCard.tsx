import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/src/constants/theme';

type Props = {
  title?: string;
  description: string;
  ctaLabel: string;
  onPress: () => void;
};

export const PaywallCard = ({
  title = 'Premium Feature',
  description,
  ctaLabel,
  onPress,
}: Props) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable onPress={onPress} style={styles.button}>
        <Text style={styles.buttonText}>{ctaLabel}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFDF6',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  title: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginTop: 4,
    alignSelf: 'flex-start',
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
