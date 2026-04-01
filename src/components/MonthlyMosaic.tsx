import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/src/constants/theme';
import { formatDateKey, getDaysInMonth, getWeekdayOffset } from '@/src/features/mood/dateUtils';
import type { MoodEntry } from '@/src/types';

type Props = {
  year: number;
  month: number;
  entriesByDate: Record<string, MoodEntry>;
  onPressDay?: (date: string) => void;
};

const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const MonthlyMosaic = ({ year, month, entriesByDate, onPressDay }: Props) => {
  const daysInMonth = getDaysInMonth(year, month);
  const offset = getWeekdayOffset(year, month);

  const cells: Array<{ date?: string; day?: number }> = [];

  for (let i = 0; i < offset; i += 1) {
    cells.push({});
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = formatDateKey(new Date(year, month, day));
    cells.push({ date, day });
  }

  return (
    <View>
      <View style={styles.weekdayRow}>
        {weekdayLabels.map((label, index) => (
          <View key={`${label}-${index}`} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell, index) => {
          if (!cell.date || !cell.day) {
            return (
              <View key={`empty-${index}`} style={styles.cellWrap}>
                <View style={[styles.cell, styles.emptyCell]} />
              </View>
            );
          }

          const entry = entriesByDate[cell.date];
          return (
            <Pressable key={cell.date} onPress={() => onPressDay?.(cell.date!)} style={styles.cellWrap}>
              <View
                style={[
                  styles.cell,
                  entry
                    ? { backgroundColor: entry.colorHex, borderStyle: 'solid' }
                    : styles.emptyCell,
                ]}
              >
                <Text style={styles.dayText}>{cell.day}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  weekdayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  weekdayCell: {
    width: '14.2857%',
    paddingVertical: 4,
  },
  weekdayText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  cellWrap: {
    width: '14.2857%',
    aspectRatio: 1,
    padding: 3,
  },
  cell: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  emptyCell: {
    backgroundColor: '#FAF7F4',
    borderStyle: 'solid',
  },
  dayText: {
    fontSize: 11,
    color: '#4A4A4A',
    fontWeight: '600',
  },
});
