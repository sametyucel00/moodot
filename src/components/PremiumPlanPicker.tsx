import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/src/constants/theme';
import type { PremiumProductKind, PremiumProductOption } from '@/src/types';

type PremiumPlanPickerProps = {
  products: PremiumProductOption[];
  busyKind?: PremiumProductKind | null;
  onSelect: (kind: PremiumProductKind) => void;
  compact?: boolean;
};

const fallbackOrder: PremiumProductKind[] = ['monthly', 'yearly', 'lifetime'];

export const PremiumPlanPicker = ({
  products,
  busyKind,
  onSelect,
  compact = false,
}: PremiumPlanPickerProps) => {
  const orderedProducts = [...products].sort(
    (left, right) => fallbackOrder.indexOf(left.kind) - fallbackOrder.indexOf(right.kind),
  );

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      {orderedProducts.map((product) => {
        const isBusy = busyKind === product.kind;
        return (
          <Pressable
            key={product.kind}
            style={[styles.card, product.kind === 'yearly' && styles.featuredCard, compact && styles.cardCompact]}
            disabled={!!busyKind}
            onPress={() => onSelect(product.kind)}
          >
            <View style={styles.headerRow}>
              <View style={styles.copy}>
                <Text style={styles.title}>{product.title}</Text>
                <Text style={styles.subtitle}>{product.subtitle}</Text>
              </View>
              {product.badge ? <Text style={styles.badge}>{product.badge}</Text> : null}
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.price}>{product.price ?? (product.isSubscription ? 'Available soon' : 'One-time')}</Text>
              <Text style={styles.cta}>{isBusy ? 'Opening...' : 'Choose'}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  wrapperCompact: {
    marginTop: 2,
  },
  card: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  cardCompact: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  featuredCard: {
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: '#1F1F1F',
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    color: '#747474',
    fontSize: 12,
    lineHeight: 17,
  },
  badge: {
    color: '#2C2C2C',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#F2F0EA',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  price: {
    color: '#262626',
    fontSize: 14,
    fontWeight: '600',
  },
  cta: {
    color: '#565656',
    fontSize: 12,
    fontWeight: '700',
  },
});
