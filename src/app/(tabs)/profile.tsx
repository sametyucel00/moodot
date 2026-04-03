import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

import { ConfirmationSheet } from '@/src/components/ConfirmationSheet';
import { MonthlyMosaic } from '@/src/components/MonthlyMosaic';
import { YearlyMosaic } from '@/src/components/YearlyMosaic';
import { COLORS } from '@/src/constants/theme';
import { useAppContext } from '@/src/features/app/AppContext';
import { exportService } from '@/src/features/export/exportService';
import { fromHourMinuteToTime, fromTimeToHourMinute } from '@/src/features/mood/dateUtils';
import { noticeService } from '@/src/features/notice/noticeService';
import { paletteService } from '@/src/features/palette/paletteService';

const shiftReminder = (time: string, deltaMinutes: number): string => {
  const { hour, minute } = fromTimeToHourMinute(time);
  const base = hour * 60 + minute + deltaMinutes;
  const wrapped = ((base % 1440) + 1440) % 1440;
  return fromHourMinuteToTime(Math.floor(wrapped / 60), wrapped % 60);
};

const Row = ({ label, right }: { label: string; right: React.ReactNode }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    {right}
  </View>
);

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
    {children}
  </View>
);

export default function ProfileScreen() {
  const {
    settings,
    updateSettings,
    runSync,
    syncState,
    authState,
    connectCloudAccount,
    disconnectCloudAccount,
<<<<<<< HEAD
    deletePremiumCloudAccount,
=======
    deleteCloudAccount,
>>>>>>> 7493727 (Initial Moodot app setup)
    entries,
  } = useAppContext();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [deletingAccount, setDeletingAccount] = React.useState(false);
  const [exportBusy, setExportBusy] = React.useState<'month' | 'monthHd' | 'year' | 'yearHd' | 'shareMonth' | 'shareYear' | null>(null);
  const availablePalettes = paletteService.getAllPalettes();
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthlyRef = React.useRef<ViewShot>(null);
  const yearlyRef = React.useRef<ViewShot>(null);

  const entriesByDate = React.useMemo(
    () =>
      entries.reduce<Record<string, (typeof entries)[number]>>((acc, entry) => {
        acc[entry.date] = entry;
        return acc;
      }, {}),
    [entries],
  );

  const providerLabel =
    authState.provider === 'apple' ? 'Apple' : authState.provider === 'google' ? 'Google' : 'Account';

  const shareExport = async (
    key: NonNullable<typeof exportBusy>,
    ref: React.RefObject<ViewShot | null>,
    quality: 'standard' | 'hd',
    dialogTitle: string,
  ) => {
    if (!ref.current) {
      noticeService.show('Export preview is still preparing.', 'error');
      return;
    }

    try {
      setExportBusy(key);
      const uri = await exportService.exportMosaicFromView({
        viewRef: ref,
        quality,
      });

      if (!(await Sharing.isAvailableAsync())) {
        noticeService.show('Sharing is not available on this device.', 'error');
        return;
      }

      await Sharing.shareAsync(uri, { dialogTitle });
      noticeService.show('Export ready.', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed.';
      noticeService.show(message, 'error');
    } finally {
      setExportBusy(null);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingHorizontal: width < 370 ? 14 : 18,
          paddingTop: Math.max(12, insets.top + 4),
          paddingBottom: Math.max(28, insets.bottom + 20),
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Profile</Text>
          <Text style={styles.heroTitle}>Keep the app personal, quiet, and ready across your devices.</Text>
        </View>

        <Section title="Preferences" description="Daily setup that feels calm on both iPhone and iPad.">
          <Row
            label="Notifications"
            right={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
              />
            }
          />

          <Row
            label={`Reminder: ${settings.reminderTime}`}
            right={
              <View style={styles.timeActions}>
                <Pressable
                  style={styles.smallButton}
                  onPress={() => updateSettings({ reminderTime: shiftReminder(settings.reminderTime, -30) })}
                >
                  <Text style={styles.smallButtonText}>-30m</Text>
                </Pressable>
                <Pressable
                  style={styles.smallButton}
                  onPress={() => updateSettings({ reminderTime: shiftReminder(settings.reminderTime, 30) })}
                >
                  <Text style={styles.smallButtonText}>+30m</Text>
                </Pressable>
              </View>
            }
          />

          <View style={styles.paletteBlock}>
            <Text style={styles.rowLabel}>Palette</Text>
            <View style={styles.paletteRows}>
              {availablePalettes.map((palette) => {
                const selected = settings.selectedPaletteId === palette.id;
                return (
                  <Pressable
                    key={palette.id}
                    style={[styles.paletteRow, selected && styles.paletteRowSelected]}
                    onPress={() => updateSettings({ selectedPaletteId: palette.id })}
                  >
                    <Text style={styles.paletteName}>{palette.name}</Text>
                    <Text style={styles.paletteMeta}>{selected ? 'Selected' : 'Available'}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Section>

        <Section title="Export" description="Create polished snapshots without leaving the quiet feel of the app.">
          <Text style={styles.exportTitle}>Month</Text>
          <View style={styles.exportActions}>
            <Pressable
              style={styles.smallButton}
              disabled={!!exportBusy}
              onPress={() => void shareExport('month', monthlyRef, 'standard', 'Export Month')}
            >
              <Text style={styles.smallButtonText}>{exportBusy === 'month' ? 'Preparing...' : 'Export'}</Text>
            </Pressable>
            <Pressable
              style={styles.smallButton}
              disabled={!!exportBusy}
              onPress={() => void shareExport('monthHd', monthlyRef, 'hd', 'Export Month HD')}
            >
              <Text style={styles.smallButtonText}>{exportBusy === 'monthHd' ? 'Preparing...' : 'HD Export'}</Text>
            </Pressable>
            <Pressable
              style={styles.smallButton}
              disabled={!!exportBusy}
              onPress={() => void shareExport('shareMonth', monthlyRef, 'hd', 'Share your month in colors')}
            >
              <Text style={styles.smallButtonText}>{exportBusy === 'shareMonth' ? 'Preparing...' : 'Share'}</Text>
            </Pressable>
          </View>

          <Text style={styles.exportTitle}>Year</Text>
          <View style={styles.exportActions}>
            <Pressable
              style={styles.smallButton}
              disabled={!!exportBusy}
              onPress={() => void shareExport('year', yearlyRef, 'standard', 'Export Year')}
            >
              <Text style={styles.smallButtonText}>{exportBusy === 'year' ? 'Preparing...' : 'Export'}</Text>
            </Pressable>
            <Pressable
              style={styles.smallButton}
              disabled={!!exportBusy}
              onPress={() => void shareExport('yearHd', yearlyRef, 'hd', 'Export Year HD')}
            >
              <Text style={styles.smallButtonText}>{exportBusy === 'yearHd' ? 'Preparing...' : 'HD Export'}</Text>
            </Pressable>
            <Pressable
              style={styles.smallButton}
              disabled={!!exportBusy}
              onPress={() => void shareExport('shareYear', yearlyRef, 'hd', 'Share your year in colors')}
            >
              <Text style={styles.smallButtonText}>{exportBusy === 'shareYear' ? 'Preparing...' : 'Share'}</Text>
            </Pressable>
          </View>
        </Section>

        <Section
          title="Cloud Backup & Sync"
          description="At the bottom by design, so the daily experience stays simple and the account layer stays quiet."
        >
          {!authState.isSignedIn ? (
            <>
              <Text style={styles.syncMessage}>Connect your account to back up colors and restore them across iPhone and iPad.</Text>
              <Pressable
                style={styles.smallButton}
                disabled={authState.loading}
                onPress={async () => {
                  try {
                    await connectCloudAccount();
                    noticeService.show('Cloud sync connected.', 'success');
                  } catch (error) {
                    const message = error instanceof Error ? error.message : 'Sign in failed.';
                    noticeService.show(message, 'error');
                  }
                }}
              >
                <Text style={styles.smallButtonText}>{authState.loading ? 'Please wait' : 'Connect account'}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.syncMessage}>Connected with {providerLabel}</Text>
              <Text style={styles.syncSubtext}>Status: {syncState.inProgress ? 'Syncing...' : 'Ready'}</Text>
              <Text style={styles.syncSubtext}>
                Last sync: {settings.cloudLastSyncedAt ? new Date(settings.cloudLastSyncedAt).toLocaleString() : 'Never'}
              </Text>
              {syncState.error ? <Text style={styles.syncError}>Sync error: {syncState.error}</Text> : null}
              <View style={styles.syncActions}>
                <Pressable
                  style={styles.smallButton}
                  disabled={syncState.inProgress}
                  onPress={async () => {
                    try {
                      await runSync();
                      noticeService.show('Synced successfully.', 'success');
                    } catch (error) {
                      const message = error instanceof Error ? error.message : 'Sync failed.';
                      noticeService.show(message, 'error');
                    }
                  }}
                >
                  <Text style={styles.smallButtonText}>{syncState.inProgress ? 'Syncing' : 'Sync now'}</Text>
                </Pressable>
                <Pressable
                  style={styles.smallButton}
                  onPress={async () => {
                    try {
                      await disconnectCloudAccount();
                      noticeService.show('Cloud account disconnected.', 'info');
                    } catch (error) {
                      const message = error instanceof Error ? error.message : 'Sign out failed.';
                      noticeService.show(message, 'error');
                    }
                  }}
                >
                  <Text style={styles.smallButtonText}>Sign out</Text>
                </Pressable>
                <Pressable style={[styles.smallButton, styles.dangerButton]} onPress={() => setDeleteModalVisible(true)}>
                  <Text style={[styles.smallButtonText, styles.dangerText]}>Delete account</Text>
                </Pressable>
              </View>
            </>
          )}
        </Section>

        <View style={styles.hiddenCaptures}>
          <ViewShot ref={monthlyRef} style={styles.hiddenCapture}>
            <View collapsable={false} style={styles.captureCanvas}>
              <Text style={styles.captureTitle}>
                {now.toLocaleString('en-US', { month: 'long' })} {year}
              </Text>
              <MonthlyMosaic year={year} month={month} entriesByDate={entriesByDate} />
            </View>
          </ViewShot>

          <ViewShot ref={yearlyRef} style={styles.hiddenCapture}>
            <View collapsable={false} style={styles.captureCanvas}>
              <Text style={styles.captureTitle}>{year}</Text>
              <YearlyMosaic year={year} entriesByDate={entriesByDate} />
            </View>
          </ViewShot>
        </View>
      </View>

      <ConfirmationSheet
        visible={deleteModalVisible}
        title="Delete cloud account?"
        description="This permanently removes the connected account and synced cloud data. Your local device data stays on this device unless you delete it separately."
        confirmLabel="Delete"
        tone="danger"
        busy={deletingAccount}
        onCancel={() => {
          if (!deletingAccount) {
            setDeleteModalVisible(false);
          }
        }}
        onConfirm={async () => {
          try {
            setDeletingAccount(true);
<<<<<<< HEAD
            await deletePremiumCloudAccount();
=======
                      await deleteCloudAccount();
>>>>>>> 7493727 (Initial Moodot app setup)
            setDeleteModalVisible(false);
            noticeService.show('Cloud account deleted.', 'success');
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Account deletion failed. Try signing in again first.';
            noticeService.show(message, 'error');
          } finally {
            setDeletingAccount(false);
          }
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FCFCFA',
  },
  content: {
    width: '100%',
    maxWidth: 840,
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
    maxWidth: 520,
  },
  section: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    color: '#171717',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionDescription: {
    color: '#747474',
    fontSize: 12,
    lineHeight: 18,
  },
  row: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowLabel: {
    color: '#202020',
    fontSize: 14,
    fontWeight: '500',
  },
  timeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },
  smallButtonText: {
    color: '#303030',
    fontSize: 12,
    fontWeight: '600',
  },
  paletteBlock: {
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  paletteRows: {
    gap: 8,
  },
  paletteRow: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paletteRowSelected: {
    borderColor: '#2E2E2E',
    borderWidth: 2,
  },
  paletteName: {
    color: '#202020',
    fontSize: 13,
    fontWeight: '600',
  },
  paletteMeta: {
    color: '#8A8A8A',
    fontSize: 12,
  },
  exportTitle: {
    color: '#232323',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  exportActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  syncMessage: {
    color: '#2C2C2C',
    fontSize: 13,
    lineHeight: 19,
  },
  syncSubtext: {
    color: '#6D6D6D',
    fontSize: 12,
  },
  syncError: {
    color: '#BB2A2A',
    fontSize: 12,
  },
  syncActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dangerButton: {
    borderColor: '#E8B9B9',
    backgroundColor: '#FFF6F6',
  },
  dangerText: {
    color: '#9E2E2E',
  },
  hiddenCaptures: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
  },
  hiddenCapture: {
    width: 720,
  },
  captureCanvas: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 14,
  },
  captureTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1D1D',
  },
});
