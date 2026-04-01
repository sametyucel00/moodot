import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PremiumPlanPicker } from '@/src/components/PremiumPlanPicker';
import { useAppContext } from '@/src/features/app/AppContext';
import { parseDateKey } from '@/src/features/mood/dateUtils';
import { noticeService } from '@/src/features/notice/noticeService';
import { paletteService } from '@/src/features/palette/paletteService';
import type { PremiumProductKind } from '@/src/types';

const monthLabel = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;

const getStreak = (dates: Set<string>) => {
  let streak = 0;
  const cursor = new Date();

  while (dates.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export default function InsightsScreen() {
  const { entries, settings, premiumProducts, purchasePremium } = useAppContext();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const fadeBase = useRef(new Animated.Value(0)).current;
  const fadePremium = useRef(new Animated.Value(0)).current;
  const [purchaseBusyKind, setPurchaseBusyKind] = React.useState<PremiumProductKind | null>(null);

  const startPremiumPurchase = async (kind: PremiumProductKind) => {
    setPurchaseBusyKind(kind);
    try {
      const ok = await purchasePremium(kind);
      noticeService.show(ok ? 'Premium unlocked.' : 'Purchase not completed.', ok ? 'success' : 'error');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Premium purchase failed.';
      noticeService.show(message, 'error');
    } finally {
      setPurchaseBusyKind(null);
    }
  };

  useEffect(() => {
    Animated.stagger(90, [
      Animated.timing(fadeBase, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(fadePremium, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeBase, fadePremium]);

  const moodDefs = paletteService.getMoodDefinitions();

  const insights = useMemo(() => {
    const now = new Date();
    const monthEntries = entries.filter((entry) => {
      const d = parseDateKey(entry.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });

    const monthMoodCount = new Map<string, number>();
    monthEntries.forEach((entry) => {
      monthMoodCount.set(entry.moodId, (monthMoodCount.get(entry.moodId) ?? 0) + 1);
    });

    const mostUsed = [...monthMoodCount.entries()].sort((a, b) => b[1] - a[1])[0];
    const mostUsedMood = moodDefs.find((mood) => mood.id === mostUsed?.[0]);

    const trackedDaysThisMonth = new Set(monthEntries.map((entry) => entry.date)).size;
    const allTrackedDates = new Set(entries.map((entry) => entry.date));
    const streak = getStreak(allTrackedDates);

    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdayCount = weekdayNames.map((name) => ({ name, count: 0 }));
    monthEntries.forEach((entry) => {
      const dayIdx = parseDateKey(entry.date).getDay();
      weekdayCount[dayIdx].count += 1;
    });
    const bestWeekday = [...weekdayCount].sort((a, b) => b.count - a.count)[0];

    const distribution = moodDefs
      .map((mood) => ({
        mood,
        count: monthMoodCount.get(mood.id) ?? 0,
      }))
      .filter((item) => item.count > 0);

    const last3Months = [0, 1, 2].map((shift) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - shift, 1);
      const count = new Set(
        entries
          .filter((entry) => {
            const d = parseDateKey(entry.date);
            return d.getFullYear() === monthDate.getFullYear() && d.getMonth() === monthDate.getMonth();
          })
          .map((entry) => entry.date),
      ).size;

      return {
        label: monthLabel(monthDate),
        count,
      };
    });

    return {
      mostUsedMoodLabel: mostUsedMood?.label ?? 'No data yet',
      mostUsedMoodColor: mostUsedMood?.defaultHex ?? '#E0E0E0',
      trackedDaysThisMonth,
      streak,
      weeklyPattern: bestWeekday && bestWeekday.count > 0 ? `${bestWeekday.name} feels the most active` : 'No weekly pattern yet',
      distribution,
      distributionTotal: distribution.reduce((sum, item) => sum + item.count, 0),
      last3Months,
    };
  }, [entries, moodDefs]);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingHorizontal: width < 370 ? 14 : 18,
          paddingTop: Math.max(12, insets.top + 4),
          paddingBottom: Math.max(16, insets.bottom + 12),
        },
      ]}
    >
      <Animated.View style={{ opacity: fadeBase, transform: [{ translateY: fadeBase.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
        <Card title="Most used color this month" value={insights.mostUsedMoodLabel} color={insights.mostUsedMoodColor} />
      </Animated.View>
      <Animated.View style={{ opacity: fadeBase, transform: [{ translateY: fadeBase.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
        <Card title="Tracked days this month" value={`${insights.trackedDaysThisMonth} days`} />
      </Animated.View>
      <Animated.View style={{ opacity: fadeBase, transform: [{ translateY: fadeBase.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
        <Card title="Current streak" value={`${insights.streak} days`} />
      </Animated.View>

      {!settings.isPremium ? (
        <Animated.View
          style={[
            styles.premiumCard,
            {
              opacity: fadePremium,
              transform: [
                {
                  translateY: fadePremium.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.premiumTitle}>Premium reflections</Text>
          <Text style={styles.premiumText}>Unlock weekly pattern, monthly color mix and a calm 3-month comparison.</Text>
          <PremiumPlanPicker
            products={premiumProducts}
            busyKind={purchaseBusyKind}
            compact
            onSelect={(kind) => void startPremiumPurchase(kind)}
          />
        </Animated.View>
      ) : (
        <Animated.View
          style={{
            gap: 12,
            opacity: fadePremium,
            transform: [{ translateY: fadePremium.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
          }}
        >
          <Card title="Weekly pattern" value={insights.weeklyPattern} />

          <View style={styles.card}>
            <Text style={styles.label}>Monthly color distribution</Text>
            {insights.distributionTotal === 0 ? (
              <Text style={styles.value}>No color data yet</Text>
            ) : (
              <>
                <View style={styles.barTrack}>
                  {insights.distribution.map((item) => (
                    <View
                      key={item.mood.id}
                      style={[
                        styles.barSegment,
                        {
                          backgroundColor: item.mood.defaultHex,
                          flex: item.count,
                        },
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.legendWrap}>
                  {insights.distribution.map((item) => (
                    <Text key={`legend-${item.mood.id}`} style={styles.legendText}>
                      {item.mood.label} {item.count}
                    </Text>
                  ))}
                </View>
              </>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Last 3 months</Text>
            <Text style={styles.softCaption}>A simple look at how often you checked in recently.</Text>
            <View style={styles.monthRows}>
              {insights.last3Months.map((item) => (
                <View key={item.label} style={styles.monthRow}>
                  <Text style={styles.monthLabel}>{item.label}</Text>
                  <Text style={styles.monthValue}>{item.count} days</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const Card = ({ title, value, color }: { title: string; value: string; color?: string }) => (
  <View style={styles.card}>
    <Text style={styles.label}>{title}</Text>
    <View style={styles.valueRow}>
      {color ? <View style={[styles.colorDot, { backgroundColor: color }]} /> : null}
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FCFCFA',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 8,
  },
  label: {
    color: '#7A7A7A',
    fontSize: 13,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  value: {
    color: '#1F1F1F',
    fontSize: 18,
    fontWeight: '700',
  },
  premiumCard: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 10,
  },
  premiumTitle: {
    color: '#1F1F1F',
    fontSize: 15,
    fontWeight: '700',
  },
  premiumText: {
    color: '#747474',
    fontSize: 13,
    lineHeight: 18,
  },
  barTrack: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#F3F3F3',
  },
  barSegment: {
    height: '100%',
  },
  legendWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  monthRows: {
    gap: 8,
  },
  softCaption: {
    fontSize: 12,
    color: '#7D7D7D',
    lineHeight: 17,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  monthLabel: {
    color: '#454545',
    fontSize: 13,
    fontWeight: '600',
  },
  monthValue: {
    color: '#666',
    fontSize: 13,
  },
});
