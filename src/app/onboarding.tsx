import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_COPY } from '@/src/constants/mood';
import { COLORS } from '@/src/constants/theme';
import { useAppContext } from '@/src/features/app/AppContext';
import { fromHourMinuteToTime, fromTimeToHourMinute } from '@/src/features/mood/dateUtils';
import { noticeService } from '@/src/features/notice/noticeService';
import { paletteService } from '@/src/features/palette/paletteService';

const shiftReminder = (time: string, deltaMinutes: number): string => {
  const { hour, minute } = fromTimeToHourMinute(time);
  const base = hour * 60 + minute + deltaMinutes;
  const wrapped = ((base % 1440) + 1440) % 1440;
  return fromHourMinuteToTime(Math.floor(wrapped / 60), wrapped % 60);
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { settings, completeOnboarding } = useAppContext();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const availablePalettes = useMemo(
    () => paletteService.getAvailablePalettes(settings.isPremium),
    [settings.isPremium],
  );

  const [selectedPaletteId, setSelectedPaletteId] = useState(settings.selectedPaletteId);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);
  const [reminderTime, setReminderTime] = useState(settings.reminderTime);
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    try {
      setSaving(true);
      await completeOnboarding({
        selectedPaletteId,
        notificationsEnabled,
        reminderTime,
      });
      router.replace('/(tabs)/today');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save onboarding settings.';
      noticeService.show(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    try {
      setSaving(true);
      await completeOnboarding({});
      router.replace('/(tabs)/today');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not continue.';
      noticeService.show(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingHorizontal: width < 370 ? 14 : 16,
          paddingTop: Math.max(12, insets.top + 6),
          paddingBottom: Math.max(16, insets.bottom + 12),
        },
      ]}
    >
      <Text style={styles.brand}>{APP_COPY.name}</Text>
      <Text style={styles.subtitle}>{APP_COPY.subtitle}</Text>
      <Text style={styles.description}>Set your preferences once. You can change all of them later in Profile.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Palette</Text>
        {availablePalettes.map((palette) => {
          const selected = selectedPaletteId === palette.id;
          return (
            <Pressable
              key={palette.id}
              onPress={() => setSelectedPaletteId(palette.id)}
              style={[styles.paletteRow, selected && styles.paletteRowSelected]}
            >
              <Text style={styles.paletteName}>{palette.name}</Text>
              <View style={styles.paletteDots}>
                {palette.colors.map((color) => (
                  <View key={`${palette.id}-${color.moodId}`} style={[styles.dot, { backgroundColor: color.hex }]} />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Reminder</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Enable notifications</Text>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Reminder time: {reminderTime}</Text>
          <View style={styles.timeControls}>
            <Pressable style={styles.timeButton} onPress={() => setReminderTime(shiftReminder(reminderTime, -30))}>
              <Text style={styles.timeButtonText}>-30m</Text>
            </Pressable>
            <Pressable style={styles.timeButton} onPress={() => setReminderTime(shiftReminder(reminderTime, 30))}>
              <Text style={styles.timeButtonText}>+30m</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.footerActions}>
        <Pressable
          style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}
          onPress={handleSkip}
          disabled={saving}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.continueButton, pressed && styles.pressed, saving && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={saving}
        >
          <Text style={styles.continueText}>{saving ? 'Saving...' : 'Continue'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: 16,
    gap: 12,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  paletteRow: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paletteRowSelected: {
    borderColor: COLORS.accent,
    borderWidth: 2,
  },
  paletteName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  paletteDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  timeControls: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
  },
  timeButtonText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  continueButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.accent,
  },
  continueText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    backgroundColor: '#9A9A9A',
  },
  footerActions: {
    marginTop: 4,
    flexDirection: 'row',
    gap: 8,
  },
  skipButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  skipText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
});
