import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppContext } from '@/src/features/app/AppContext';
import { parseDateKey } from '@/src/features/mood/dateUtils';
import { paletteService } from '@/src/features/palette/paletteService';

const monthLabel = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

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
  const { entries } = useAppContext();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const fade = useRef(new Animated.Value(0)).current;
  const moodDefs = paletteService.getMoodDefinitions();

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [fade]);

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
      weekdayCount[parseDateKey(entry.date).getDay()].count += 1;
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
      mostUsedMoodLabel: mostUsedMood?.label ?? 'No colors yet',
      mostUsedMoodColor: mostUsedMood?.defaultHex ?? '#E0E0E0',
      trackedDaysThisMonth,
      streak,
      weeklyPattern:
        bestWeekday && bestWeekday.count > 0 ? `${bestWeekday.name} is where your rhythm shows up most.` : 'Your weekly rhythm will appear after a few more check-ins.',
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
          paddingBottom: Math.max(18, insets.bottom + 14),
        },
      ]}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fade,
            transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
          },
        ]}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>This month</Text>
          <Text style={styles.heroTitle}>A softer look at your color rhythm.</Text>
          <Text style={styles.heroText}>Everything is unlocked in the paid app, so your full reflection stays in one calm place.</Text>
        </View>

        <Card title="Most used color" value={insights.mostUsedMoodLabel} color={insights.mostUsedMoodColor} />
        <Card title="Tracked days" value={`${insights.trackedDaysThisMonth} days`} />
        <Card title="Current streak" value={`${insights.streak} days`} />
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
          <Text style={styles.softCaption}>A light comparison of how often you checked in recently.</Text>
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
  },
  content: {
    width: '100%',
    maxWidth: 840,
    alignSelf: 'center',
    gap: 12,
  },
  heroCard: {
    borderWidth: 1,
    borderColor: '#ECE7E0',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 20,
    gap: 8,
  },
  heroEyebrow: {
    color: '#847565',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: '#181818',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    maxWidth: 420,
  },
  heroText: {
    color: '#6F6A64',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 520,
  },
  card: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 18,
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
    lineHeight: 24,
    fontWeight: '700',
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
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
