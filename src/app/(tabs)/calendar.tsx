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
          paddingBottom: Math.max(18, insets.bottom + 14),
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Calendar</Text>
          <Text style={styles.heroTitle}>See the shape of your days at a glance.</Text>
          <Text style={styles.heroText}>Monthly detail sits up front, while the yearly view keeps the bigger rhythm close.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>{isCurrentMonth ? 'This Month' : 'Month'}</Text>
              <Text style={styles.sectionTitle}>
                {monthLabels[month]} {year}
              </Text>
            </View>
            <View style={styles.navGroup}>
              <NavButton label="<" onPress={goPrevMonth} />
              <NavButton label=">" onPress={goNextMonth} />
            </View>
          </View>

          <MonthlyMosaic year={year} month={month} entriesByDate={entriesByDate} onPressDay={setSelectedDate} />
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>{isCurrentYear ? 'This Year' : 'Year'}</Text>
              <Text style={styles.sectionTitle}>{year}</Text>
            </View>
            <View style={styles.navGroup}>
              <NavButton label="<" onPress={() => setYear((prev) => prev - 1)} />
              <NavButton label=">" onPress={() => setYear((prev) => prev + 1)} />
            </View>
          </View>

          <YearlyMosaic year={year} entriesByDate={entriesByDate} />
        </View>

        {entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No colors yet</Text>
            <Text style={styles.emptyText}>Your saved days will start filling both calendar views here.</Text>
          </View>
        ) : null}
      </View>

      <Modal transparent visible={!!selectedDate} animationType="fade" onRequestClose={() => setSelectedDate(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedDate(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalDate}>{selectedDate ? parseDateKey(selectedDate).toLocaleDateString('en-US') : ''}</Text>
            <Text style={styles.modalLabel}>Color</Text>
            <Text style={styles.modalValue}>{selectedMoodLabel ?? 'No entry'}</Text>
            <Text style={styles.modalLabel}>Note</Text>
            <Text style={styles.modalValue}>{selectedEntry?.note?.trim() || 'No note'}</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const NavButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.navButton}>
    <Text style={styles.navButtonText}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FCFCFA',
  },
  content: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
    gap: 14,
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
    color: '#161616',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    maxWidth: 460,
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
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionEyebrow: {
    color: '#877C70',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  sectionTitle: {
    marginTop: 3,
    color: '#191919',
    fontSize: 22,
    fontWeight: '700',
  },
  navGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    minWidth: 42,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E0D8',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#FCFAF7',
  },
  navButtonText: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '700',
    color: '#4A4138',
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 20,
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
    backgroundColor: 'rgba(10,10,10,0.24)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    gap: 6,
  },
  modalDate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  modalLabel: {
    fontSize: 12,
    color: '#868686',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  modalValue: {
    fontSize: 14,
    lineHeight: 19,
    color: '#434343',
    marginBottom: 4,
  },
});

