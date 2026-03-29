import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MonthlyMosaic } from '@/src/components/MonthlyMosaic';
import { YearlyMosaic } from '@/src/components/YearlyMosaic';
import { useAppContext } from '@/src/features/app/AppContext';
import { parseDateKey } from '@/src/features/mood/dateUtils';
import { paletteService } from '@/src/features/palette/paletteService';

const monthLabels = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function CalendarScreen() {
  const { entries } = useAppContext();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();
  const isCurrentYear = year === now.getFullYear();

  const entriesByDate = useMemo(
    () =>
      entries.reduce<Record<string, (typeof entries)[number]>>((acc, entry) => {
        acc[entry.date] = entry;
        return acc;
      }, {}),
    [entries],
  );

  const goPrevMonth = () => {
    setMonth((prev) => {
      if (prev === 0) {
        setYear((current) => current - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goNextMonth = () => {
    setMonth((prev) => {
      if (prev === 11) {
        setYear((current) => current + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const goPrevYear = () => {
    setYear((prev) => prev - 1);
  };

  const goNextYear = () => {
    setYear((prev) => prev + 1);
  };

  const selectedEntry = selectedDate ? entriesByDate[selectedDate] : undefined;
  const selectedMoodLabel = selectedEntry
    ? paletteService.getMoodDefinitions().find((mood) => mood.id === selectedEntry.moodId)?.label
    : undefined;

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
      <View style={styles.monthHeader}>
        <Pressable onPress={goPrevMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>{'<'}</Text>
        </Pressable>
        <Text style={styles.monthLabel}>
          {monthLabels[month]} {year}
        </Text>
        <Pressable onPress={goNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>{'>'}</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>{isCurrentMonth ? 'This Month' : 'Month'}</Text>
      <View style={styles.card}>
        <MonthlyMosaic year={year} month={month} entriesByDate={entriesByDate} onPressDay={setSelectedDate} />
      </View>

      <View style={styles.yearHeader}>
        <Text style={styles.sectionTitle}>{isCurrentYear ? 'This Year' : 'Year'}</Text>
        <View style={styles.yearActions}>
          <Pressable onPress={goPrevYear} style={styles.navButton}>
            <Text style={styles.navButtonText}>{'<'}</Text>
          </Pressable>
          <Pressable onPress={goNextYear} style={styles.navButton}>
            <Text style={styles.navButtonText}>{'>'}</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.card}>
        <YearlyMosaic year={year} entriesByDate={entriesByDate} />
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No colors yet</Text>
          <Text style={styles.emptyText}>Your saved days will start filling both calendar views here.</Text>
        </View>
      ) : null}

      <Modal transparent visible={!!selectedDate} animationType="fade" onRequestClose={() => setSelectedDate(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedDate(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalDate}>{selectedDate ? parseDateKey(selectedDate).toLocaleDateString('en-US') : ''}</Text>
            <Text style={styles.modalLine}>Color: {selectedMoodLabel ?? 'No entry'}</Text>
            <Text style={styles.modalLine}>Note: {selectedEntry?.note?.trim() || 'No note'}</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FCFCFA',
    gap: 14,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  navButton: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
  },
  yearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yearActions: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 14,
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 18,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#707070',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.25)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  modalDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },
  modalLine: {
    fontSize: 14,
    color: '#4B4B4B',
  },
});
