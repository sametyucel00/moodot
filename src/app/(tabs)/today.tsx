import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Keyboard,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  UIManager,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ColorPicker } from '@/src/components/ColorPicker';
import { NoteInput } from '@/src/components/NoteInput';
import { COLORS } from '@/src/constants/theme';
import { useAppContext } from '@/src/features/app/AppContext';
import { getTodayKey, parseDateKey } from '@/src/features/mood/dateUtils';
import { noticeService } from '@/src/features/notice/noticeService';
import { paletteService } from '@/src/features/palette/paletteService';
import type { MoodId } from '@/src/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TodayScreen() {
  const { settings, saveTodayMood, getEntryByDate, loading } = useAppContext();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const todayKey = getTodayKey();
  const existingEntry = getEntryByDate(todayKey);
  const [selectedMoodId, setSelectedMoodId] = useState<MoodId | undefined>(existingEntry?.moodId);
  const [note, setNote] = useState(existingEntry?.note ?? '');
  const [saving, setSaving] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [noteFocused, setNoteFocused] = useState(false);
  const scrollRef = React.useRef<ScrollView>(null);
  const noteInputRef = React.useRef<TextInput>(null);

  React.useEffect(() => {
    setSelectedMoodId(existingEntry?.moodId);
    setNote(existingEntry?.note ?? '');
  }, [existingEntry?.moodId, existingEntry?.note]);

  React.useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const palette = paletteService.getPaletteById(settings.selectedPaletteId) ?? paletteService.getAllPalettes()[0];
  const colorByMoodId = useMemo(
    () =>
      palette.colors.reduce<Record<string, string>>((acc, color) => {
        acc[color.moodId] = color.hex;
        return acc;
      }, {}),
    [palette],
  );

  const handleSave = async () => {
    if (!selectedMoodId) {
      return;
    }

    try {
      setSaving(true);
      await saveTodayMood({ moodId: selectedMoodId, note });
      noteInputRef.current?.blur();
      Keyboard.dismiss();
      setNoteFocused(false);
      noticeService.show(existingEntry ? 'Updated.' : 'Saved.', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save entry.';
      noticeService.show(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const todayDate = parseDateKey(todayKey);
  const day = `${todayDate.getDate()}`.padStart(2, '0');
  const monthName = todayDate.toLocaleString('en-US', { month: 'long' });
  const weekdayName = todayDate.toLocaleString('en-US', { weekday: 'long' });
  const detailedDateText = `${day} ${monthName} ${todayDate.getFullYear()} ${weekdayName}`;
  const horizontalPadding = width < 370 ? 16 : 24;
  const titleSize = width < 370 ? 30 : 34;
  const titleLineHeight = width < 370 ? 36 : 40;

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        noteInputRef.current?.blur();
        Keyboard.dismiss();
      }}
      accessible={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 72 : 14}
        style={styles.flex}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.container,
            {
              paddingHorizontal: horizontalPadding,
              paddingTop: Math.max(18, insets.top + 8),
              paddingBottom: Math.max(20, insets.bottom + (keyboardOpen ? 180 : 16)),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => {
            noteInputRef.current?.blur();
            Keyboard.dismiss();
          }}
        >
          <Text style={styles.date}>{detailedDateText}</Text>

          <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleLineHeight }]}>
            What color was your day?
          </Text>

          <ColorPicker
            moods={paletteService.getMoodDefinitions()}
            selectedMoodId={selectedMoodId}
            colorByMoodId={colorByMoodId}
            onSelect={(moodId) => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setSelectedMoodId(moodId);
              setNoteFocused(false);
              noteInputRef.current?.blur();
              Keyboard.dismiss();
            }}
          />

          <NoteInput
            inputRef={noteInputRef}
            value={note}
            onChange={setNote}
            maxLength={100}
            onFocus={() => {
              setNoteFocused(true);
              setTimeout(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              }, 120);
            }}
            onBlur={() => setNoteFocused(false)}
          />

          <Pressable
            onPress={handleSave}
            disabled={saving || loading || !selectedMoodId}
            style={({ pressed }) => [
              styles.saveButton,
              (saving || loading || !selectedMoodId) && styles.saveButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
          </Pressable>

          {noteFocused ? <Text style={styles.noteHint}>Tap outside the note field to close the keyboard.</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    backgroundColor: '#FCFCFA',
    gap: 24,
    minHeight: '100%',
  },
  date: {
    fontSize: 13,
    color: '#8A8A8A',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    color: '#141414',
    fontWeight: '700',
    maxWidth: 290,
  },
  saveButton: {
    marginTop: 4,
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#A6A6A6',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.88,
  },
  noteHint: {
    marginTop: -8,
    fontSize: 12,
    color: '#7A7A7A',
    textAlign: 'center',
  },
});
