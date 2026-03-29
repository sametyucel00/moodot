import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { COLORS } from '@/src/constants/theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
};

export const NoteInput = ({ value, onChange, maxLength = 100, onFocus, onBlur, inputRef }: Props) => {
  return (
    <View style={styles.wrapper}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        maxLength={maxLength}
        multiline={false}
        returnKeyType="done"
        blurOnSubmit
        onSubmitEditing={() => inputRef?.current?.blur()}
        placeholder="Add a note (optional)"
        placeholderTextColor={COLORS.textSecondary}
        style={styles.input}
      />
      <Text style={styles.count}>{value.length}/{maxLength}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.card,
    fontSize: 15,
  },
  count: {
    textAlign: 'right',
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
