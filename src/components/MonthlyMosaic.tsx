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
          <Text key={`${label}-${index}`} style={styles.weekdayText}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell, index) => {
          if (!cell.date || !cell.day) {
            return <View key={`empty-${index}`} style={styles.cell} />;
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
    justifyContent: 'space-between',
  },
  weekdayText: {
    width: '14.2857%',
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cellWrap: {
    width: '14.2857%',
    aspectRatio: 1,
    padding: 2,
  },
  cell: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  emptyCell: {
    backgroundColor: '#F7F7F7',
    borderStyle: 'dashed',
  },
  dayText: {
    fontSize: 10,
    color: '#4A4A4A',
    fontWeight: '600',
  },
});
