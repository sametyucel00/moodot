import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/src/constants/theme';
import { formatDateKey, getDaysInMonth, getWeekdayOffset } from '@/src/features/mood/dateUtils';
import type { MoodEntry } from '@/src/types';

type Props = {
  year: number;
  entriesByDate: Record<string, MoodEntry>;
};

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const YearlyMosaic = ({ year, entriesByDate }: Props) => {
  return (
    <View style={styles.container}>
      {monthLabels.map((label, monthIndex) => {
        const cells: string[] = [];
        const offset = getWeekdayOffset(year, monthIndex);
        const dayCount = getDaysInMonth(year, monthIndex);

        for (let i = 0; i < offset; i += 1) {
          cells.push(`empty-${i}`);
        }

        for (let day = 1; day <= dayCount; day += 1) {
          const date = formatDateKey(new Date(year, monthIndex, day));
          cells.push(date);
        }

        return (
          <View key={label} style={styles.monthBlock}>
            <Text style={styles.monthLabel}>{label}</Text>
            <View style={styles.monthGrid}>
              {cells.map((cell, index) => {
                const entry = entriesByDate[cell];
                const isEmpty = cell.startsWith('empty-');

                return (
                  <View
                    key={`${label}-${cell}-${index}`}
                    style={[
                      styles.pixel,
                      {
                        backgroundColor: isEmpty ? '#F7F7F7' : (entry?.colorHex ?? COLORS.passive),
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  monthBlock: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 10,
    backgroundColor: COLORS.card,
  },
  monthLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 3,
    columnGap: 3,
  },
  pixel: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
});
