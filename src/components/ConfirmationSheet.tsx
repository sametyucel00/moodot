import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/src/constants/theme';

type Props = {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmationSheet = ({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'default',
  busy = false,
  onCancel,
  onConfirm,
}: Props) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={onCancel} disabled={busy}>
              <Text style={styles.secondaryText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryButton, tone === 'danger' && styles.dangerButton, busy && styles.disabledButton]}
              onPress={onConfirm}
              disabled={busy}
            >
              <Text style={[styles.primaryText, tone === 'danger' && styles.dangerText]}>
                {busy ? 'Please wait...' : confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(14, 16, 18, 0.32)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#ECEBE7',
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    backgroundColor: '#FFF3F3',
    borderWidth: 1,
    borderColor: '#F1C9C9',
  },
  disabledButton: {
    opacity: 0.65,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dangerText: {
    color: '#A02B2B',
  },
});
